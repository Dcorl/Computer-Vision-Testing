import time
#Runtime complexity O(n)
#Memory 0(n)

class ObjectTracker:
    def __init__(self):
        #Short term memory
        self.pending = {}
        #Long term memory
        self.confirmed = {}

    # Logical Process To move objects between pending and confirmed
    def process(self, detections):

        #Current time per frame
        now = time.time()

        for track_id, data in detections.items():
            #1. Start checking pending stuff with logic
            # Notes: YOLO confidence loads on first frame
            if data["confidence"] < 0.50:
                if track_id in self.pending:
                    self.pending[track_id]["dip_count"] += 1

                    if self.pending[track_id]["dip_count"] > 5:
                        del self.pending[track_id]
                continue

            #2. Adding objects from detection to pending, setting time and dip-count to default
            if track_id not in self.pending:
                self.pending[track_id] = {
                    **data,
                    "first_seen": now,
                    "last_seen": now,
                    "dip_count": 0,
                }
            # Updating last seen in pending
            else:
                self.pending[track_id]["last_seen"] = now

            #3. Promote pending object to confirmed after 0.5 seconds
            if now - self.pending[track_id]["first_seen"] >= 0.5:
                self.confirmed[track_id] = {
                    **data,
                    "last_seen": now
                }

        return self.confirmed

    def expire(self):
        # Removing stale objects to keep detections current
        now = time.time()

        #5. Remove object from confirmed if not detected in 1 second
        self.confirmed = {
            track_id: data
            for track_id, data in self.confirmed.items()
            if now - data["last_seen"] < 1.0
        }

        #6. Remove from pending if object is not seen in 4 seconds
        self.pending = {
            track_id: data
            for track_id, data in self.pending.items()
            if now - data["last_seen"] < 4.0
        }