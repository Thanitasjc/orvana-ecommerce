const POS_SESSION_KEY = "aesthete_pos_walk_in_session";

export function getPosSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let sessionId = window.localStorage.getItem(POS_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem(POS_SESSION_KEY, sessionId);
  }

  return sessionId;
}
