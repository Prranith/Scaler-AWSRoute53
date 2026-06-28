import json
import uuid
import random
from datetime import datetime, timezone
from app.database import SessionLocal, create_tables
from app.models.user import User
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.services.auth import hash_password

def seed():
    create_tables()
    db = SessionLocal()
    try:
        # Find or create admin user
        admin = db.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                username="admin",
                email="admin@route53.local",
                hashed_password=hash_password("admin123"),
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # Clear existing hosted zones for admin
        db.query(HostedZone).filter_by(user_id=admin.id).delete()
        db.commit()

        # Seed data configuration
        seed_zones_data = [
            {
                "name": "acme-corp.com.",
                "type": "Public",
                "comment": "Main corporate portal and website",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["198.51.100.12", "198.51.100.13"], "comment": "Apex load balancers"},
                    {"name": "www", "type": "CNAME", "ttl": 3600, "value": ["acme-corp.com."], "comment": "WWW alias"},
                    {"name": "@", "type": "AAAA", "ttl": 300, "value": ["2001:db8::1"], "comment": "IPv6 load balancers"},
                    {"name": "@", "type": "MX", "ttl": 1800, "value": ["10 mail.acme-corp.com.", "20 mail-backup.acme-corp.com."], "priority": 10, "comment": "Google Workspace mail delivery"},
                    {"name": "@", "type": "TXT", "ttl": 3600, "value": ["\"v=spf1 include:_spf.google.com ~all\"", "\"google-site-verification=aBcDeFg12345\""], "comment": "SPF and site verification tokens"},
                    {"name": "api", "type": "A", "ttl": 60, "value": ["198.51.100.100"], "comment": "API Gateway end point"},
                ]
            },
            {
                "name": "staging.acme-corp.com.",
                "type": "Public",
                "comment": "Staging environment for QA and client reviews",
                "records": [
                    {"name": "@", "type": "A", "ttl": 60, "value": ["198.51.100.15"], "comment": "Staging frontend server"},
                    {"name": "api", "type": "A", "ttl": 60, "value": ["198.51.100.16"], "comment": "Staging backend api"},
                    {"name": "db", "type": "CNAME", "ttl": 60, "value": ["rds-staging.c32jh721.us-east-1.rds.amazonaws.com."], "comment": "Staging Database RDS endpoint"},
                ]
            },
            {
                "name": "internal.corp.",
                "type": "Private",
                "comment": "Private corporate VPC resources",
                "records": [
                    {"name": "active-directory", "type": "A", "ttl": 3600, "value": ["10.0.1.10", "10.0.2.10"], "comment": "Domain Controllers"},
                    {"name": "ldap", "type": "A", "ttl": 3600, "value": ["10.0.1.11"], "comment": "Internal authentication server"},
                    {"name": "wiki", "type": "A", "ttl": 3600, "value": ["10.0.1.200"], "comment": "Confluence wiki internal page"},
                    {"name": "gitlab", "type": "A", "ttl": 120, "value": ["10.0.1.250"], "comment": "VPC Code Repository server"},
                ]
            },
            {
                "name": "myportfolio.dev.",
                "type": "Public",
                "comment": "Personal developer portfolio and playground",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["76.76.21.21"], "comment": "Vercel deployments entrypoint"},
                    {"name": "www", "type": "CNAME", "ttl": 3600, "value": ["cname.vercel-dns.com."], "comment": "Vercel CNAME mapping"},
                    {"name": "blog", "type": "CNAME", "ttl": 3600, "value": ["hashnode.network."], "comment": "Hashnode developer blog redirect"},
                ]
            },
            {
                "name": "nexus-games.io.",
                "type": "Public",
                "comment": "Indie game studio homepage & multiplayer game backend",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["185.190.140.10"], "comment": "Apex server host"},
                    {"name": "lobby", "type": "A", "ttl": 60, "value": ["185.190.140.22"], "comment": "Multiplayer matchmaking lobby"},
                    {"name": "eu-server-1", "type": "A", "ttl": 60, "value": ["185.190.140.50"], "comment": "Frankfurt game node"},
                    {"name": "us-server-1", "type": "A", "ttl": 60, "value": ["185.190.140.60"], "comment": "Oregon game node"},
                    {"name": "_minecraft._tcp", "type": "SRV", "ttl": 3600, "value": ["0 5 25565 us-server-1.nexus-games.io."], "priority": 0, "comment": "Studio Minecraft Server SRV pointer"},
                ]
            },
            {
                "name": "saas-analytics.net.",
                "type": "Public",
                "comment": "Multi-tenant B2B Analytics Platform API endpoints",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["34.200.120.44"]},
                    {"name": "collector", "type": "A", "ttl": 60, "value": ["34.200.120.45", "34.200.120.46"], "comment": "High throughput data collector load balancer"},
                    {"name": "app", "type": "CNAME", "ttl": 300, "value": ["cloudfront.saas-analytics.net."], "comment": "Cloudfront CDN distribution alias"},
                    {"name": "dashboard", "type": "CNAME", "ttl": 300, "value": ["cloudfront.saas-analytics.net."]},
                ]
            },
            {
                "name": "secure-pay.co.uk.",
                "type": "Public",
                "comment": "E-commerce gateway transaction servers",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["195.43.20.10"]},
                    {"name": "checkout", "type": "A", "ttl": 300, "value": ["195.43.20.11"]},
                    {"name": "api", "type": "A", "ttl": 60, "value": ["195.43.20.12"]},
                    {"name": "@", "type": "CAA", "ttl": 86400, "value": ["0 issue \"digicert.com\"", "0 issuewild \"digicert.com\""], "comment": "Certificate authority validation parameters"},
                ]
            },
            {
                "name": "smart-home.local.",
                "type": "Private",
                "comment": "Local subnet home lab & automated appliances",
                "records": [
                    {"name": "homeassistant", "type": "A", "ttl": 3600, "value": ["192.168.1.100"], "comment": "Smart home supervisor hub"},
                    {"name": "nas", "type": "A", "ttl": 3600, "value": ["192.168.1.101"], "comment": "TrueNAS scale storage"},
                    {"name": "router", "type": "A", "ttl": 3600, "value": ["192.168.1.1"], "comment": "Edge router gateway"},
                    {"name": "plex", "type": "CNAME", "ttl": 300, "value": ["nas.smart-home.local."], "comment": "Media player shortcut"},
                ]
            },
            {
                "name": "devops-academy.org.",
                "type": "Public",
                "comment": "E-learning platform hosted records",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["104.21.32.22", "172.67.140.5"]},
                    {"name": "learn", "type": "CNAME", "ttl": 3600, "value": ["teachable.com."]},
                    {"name": "docs", "type": "CNAME", "ttl": 3600, "value": ["readthedocs.io."]},
                ]
            },
            {
                "name": "infra.net.",
                "type": "Public",
                "comment": "Primary domain for nameserver mapping and backend assets",
                "records": [
                    {"name": "ns1", "type": "A", "ttl": 86400, "value": ["203.0.113.1"], "comment": "Primary custom nameserver record"},
                    {"name": "ns2", "type": "A", "ttl": 86400, "value": ["203.0.113.2"], "comment": "Secondary custom nameserver record"},
                ]
            },
            {
                "name": "netflix-clone.info.",
                "type": "Public",
                "comment": "Demo showcase web app link records",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["75.2.60.5"]},
                    {"name": "video", "type": "CNAME", "ttl": 300, "value": ["media-streamer.cloud."]},
                ]
            },
            {
                "name": "google-test.com.",
                "type": "Public",
                "comment": "Sandbox validation zone",
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": ["142.250.190.46"]},
                ]
            }
        ]

        # Add 30 additional realistic domains to demonstrate pagination
        additional_domains = [
            ("alpha-tech.net", "Public", "Next-gen tech consultancy"),
            ("beta-labs.org", "Public", "Biotech research and innovations"),
            ("gamma-solutions.com", "Public", "Enterprise software solutions"),
            ("delta-consulting.biz", "Public", "Business strategies and growth advisory"),
            ("epsilon-networks.io", "Public", "Decentralized mesh networks"),
            ("zeta-security.com", "Public", "Cybersecurity and penetration testing"),
            ("eta-ventures.dev", "Public", "Early stage tech venture capitalist fund"),
            ("theta-designs.co", "Public", "Premium UI/UX design studio portal"),
            ("iota-systems.io", "Public", "IoT sensor arrays and management"),
            ("kappa-media.tv", "Public", "Streaming news and esports platform"),
            ("lambda-cloud.com", "Public", "Serverless compute platform resources"),
            ("mu-hosting.net", "Public", "High performance web hosting"),
            ("nu-analytics.com", "Public", "Real-time user behavior tracking"),
            ("xi-payments.org", "Public", "Non-profit financial transactions gateway"),
            ("omicron-labs.info", "Public", "Scientific simulation assets"),
            ("pi-education.org", "Public", "Online academy and certifications"),
            ("rho-delivery.com", "Public", "Autonomous drone shipping service"),
            ("sigma-retail.uk", "Public", "E-commerce fashion and retail catalog"),
            ("tau-gaming.io", "Public", "Online multiplayer chess hosting platform"),
            ("upsilon-media.com", "Public", "Podcast production and syndication network"),
            ("phi-crypto.net", "Public", "Cryptographic signature validation nodes"),
            ("chi-consultants.com", "Public", "Strategic corporate consulting"),
            ("psi-logistics.net", "Public", "Supply chain tracking and shipping service"),
            ("omega-global.com", "Public", "International shipping container coordination"),
            ("cloud-scale.info", "Public", "Distributed load testing and benchmarking services"),
            ("data-mesh.dev", "Public", "Developer datasets and training platform"),
            ("micro-services.io", "Public", "Kubernetes cluster registry"),
            ("auth-gate.net", "Public", "Single sign-on identity assertion providers"),
            ("payment-hub.co.uk", "Public", "Payment aggregation processor API"),
            ("metrics-tracker.org", "Public", "Open source server telemetries repository"),
            ("api-gateway.internal", "Private", "Internal routing gateway for secure microservices"),
            ("dns-resolver.internal", "Private", "Local VPC DNS forwarding service"),
        ]
        for name, ztype, comment in additional_domains:
            ip = f"192.0.2.{random.randint(10, 250)}"
            seed_zones_data.append({
                "name": f"{name}.",
                "type": ztype,
                "comment": comment,
                "records": [
                    {"name": "@", "type": "A", "ttl": 300, "value": [ip], "comment": "Main IP address"},
                    {"name": "www", "type": "CNAME", "ttl": 3600, "value": [f"{name}."], "comment": "WWW alias"}
                ]
            })

        # Seed data execution loop
        for zone_data in seed_zones_data:
            zone_id = f"Z{uuid.uuid4().hex[:12].upper()}"
            name = zone_data["name"]
            
            # Default SOA & NS values matching standard AWS defaults
            ns_idx = random.randint(100, 2000)
            awsdns_ns = [
                f"ns-{ns_idx}.awsdns-{ns_idx % 100:02d}.org.",
                f"ns-{ns_idx+1}.awsdns-{(ns_idx+1) % 100:02d}.co.uk.",
                f"ns-{ns_idx+2}.awsdns-{(ns_idx+2) % 100:02d}.com.",
                f"ns-{ns_idx+3}.awsdns-{(ns_idx+3) % 100:02d}.net."
            ]
            soa_val = f"{awsdns_ns[0]} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"

            # Create hosted zone model
            zone = HostedZone(
                id=zone_id,
                user_id=admin.id,
                name=name,
                type=zone_data["type"],
                comment=zone_data["comment"],
                record_count=2 + len(zone_data["records"]),
            )
            db.add(zone)

            # Add required Default DNS Records: SOA & NS
            soa_rec = DNSRecord(
                id=str(uuid.uuid4()),
                zone_id=zone_id,
                name="@",
                type="SOA",
                ttl=900,
                routing_policy="Simple",
                value=json.dumps([soa_val]),
                comment="System generated SOA record"
            )
            ns_rec = DNSRecord(
                id=str(uuid.uuid4()),
                zone_id=zone_id,
                name="@",
                type="NS",
                ttl=172800,
                routing_policy="Simple",
                value=json.dumps(awsdns_ns),
                comment="System generated Nameserver delegation record"
            )
            db.add(soa_rec)
            db.add(ns_rec)

            # Add Custom DNS Records
            for rec_data in zone_data["records"]:
                # Correct absolute names (like www -> www.domain.com.)
                rec_name = rec_data["name"]
                if rec_name == "@":
                    full_name = name
                else:
                    full_name = f"{rec_name}.{name}"

                db_rec = DNSRecord(
                    id=str(uuid.uuid4()),
                    zone_id=zone_id,
                    name=full_name,
                    type=rec_data["type"],
                    ttl=rec_data["ttl"],
                    routing_policy="Simple",
                    value=json.dumps(rec_data["value"]),
                    priority=rec_data.get("priority"),
                    comment=rec_data.get("comment")
                )
                db.add(db_rec)

        db.commit()
        print(f"SUCCESSFULLY SEEDED {len(seed_zones_data)} HOSTED ZONES AND ALL DNS RECORDS!")
    except Exception as e:
        db.rollback()
        print(f"ERROR DURING SEEDING: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
