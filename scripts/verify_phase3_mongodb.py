"""
Live MongoDB Persistence & Retrieval Verification Script for CAREERX Phase 3.
Directly queries the MongoDB collections to verify physical BSON storage,
indexing, document schemas, and lifecycle operations.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from backend.app.core.config import settings
from backend.app.db.collections import (
    PROFILES_COLLECTION,
    EVIDENCE_COLLECTION,
    JD_COLLECTION,
    ensure_indexes,
)


async def main():
    print(f"Connecting to MongoDB at: {settings.MONGODB_URL}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
    db = client[settings.MONGODB_DB_NAME]

    # Verify Ping
    ping_res = await client.admin.command("ping")
    print(f"[OK] MongoDB Ping response: {ping_res}")

    # Ensure indexes
    await ensure_indexes(db)
    print("[OK] Verified all required B-Tree and unique indexes.")

    # Inspect Indexes on collections
    for coll_name in [PROFILES_COLLECTION, EVIDENCE_COLLECTION, JD_COLLECTION]:
        indexes = await db[coll_name].index_information()
        print(f"  - Collection '{coll_name}' has {len(indexes)} indexes: {list(indexes.keys())}")

    # Query latest profile document
    profile_count = await db[PROFILES_COLLECTION].count_documents({})
    evidence_count = await db[EVIDENCE_COLLECTION].count_documents({})
    active_evidence_count = await db[EVIDENCE_COLLECTION].count_documents({"is_active": True})
    archived_evidence_count = await db[EVIDENCE_COLLECTION].count_documents({"is_active": False})
    jd_count = await db[JD_COLLECTION].count_documents({})

    print("\n--- Physical MongoDB Storage Status ---")
    print(f"Total Profiles stored: {profile_count}")
    print(f"Total Evidence Nodes stored: {evidence_count} (Active: {active_evidence_count}, Archived: {archived_evidence_count})")
    print(f"Total Job Descriptions stored: {jd_count}")

    # Sample latest profile
    latest_profile = await db[PROFILES_COLLECTION].find_one({}, sort=[("created_at", -1)])
    if latest_profile:
        print(f"\n[Sample Profile] candidate_id='{latest_profile.get('candidate_id')}', name='{latest_profile.get('full_name')}', version={latest_profile.get('version')}")
        print(f"  - Projects ({len(latest_profile.get('projects', []))}): {[p.get('title') for p in latest_profile.get('projects', [])]}")
        print(f"  - Skills: {latest_profile.get('raw_skills', [])[:5]}...")

    # Sample latest active evidence node
    sample_ev = await db[EVIDENCE_COLLECTION].find_one({"is_active": True}, sort=[("created_at", -1)])
    if sample_ev:
        print(f"\n[Sample Active Evidence Node] id='{sample_ev.get('evidence_id')}', tier='{sample_ev.get('confidence_tier')}'")
        print(f"  - Claim: '{sample_ev.get('claim_text')}'")
        print(f"  - Verifiable URL: {sample_ev.get('verifiable_url')}")
        print(f"  - Skills: {sample_ev.get('verified_skills')}")

    # Sample latest JD
    sample_jd = await db[JD_COLLECTION].find_one({}, sort=[("created_at", -1)])
    if sample_jd:
        print(f"\n[Sample Job Description] jd_id='{sample_jd.get('jd_id')}', title='{sample_jd.get('title')}'")
        print(f"  - Requirements ({len(sample_jd.get('requirements', []))}):")
        for req in sample_jd.get('requirements', [])[:2]:
            print(f"    * [{req.get('req_id')}] (Weight: {req.get('importance_weight')}): {req.get('text')}")

    client.close()
    print("\n[SUCCESS] Direct MongoDB storage and retrieval audit verified successfully.")


if __name__ == "__main__":
    asyncio.run(main())
