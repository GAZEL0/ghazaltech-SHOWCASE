/**
 * API route pattern sample (redacted from production project).
 * Focus: authorization + ownership checks + optional attachment flow.
 */

type Session = {
  user: {
    id: string;
    role: "CLIENT" | "ADMIN" | "PARTNER";
  };
} | null;

async function ensureAccess(projectId: string, session: Session) {
  if (!session) return null;

  const project = await findProjectWithOwner(projectId); // redacted query
  if (!project) return null;

  if (session.user.role === "ADMIN" || session.user.role === "PARTNER") {
    return project;
  }

  if (project.ownerUserId !== session.user.id) return null;
  return project;
}

export async function postComment(request: Request, projectId: string, phaseId: string) {
  const session = await getSession(); // redacted auth adapter
  const project = await ensureAccess(projectId, session);
  if (!project) return json({ error: "Unauthorized" }, 401);

  const phase = await findPhase(projectId, phaseId);
  if (!phase) return json({ error: "Not found" }, 404);

  const { bodyText, attachmentUrl } = await parseBodyAndOptionalAttachment(request);
  if (!bodyText && !attachmentUrl) {
    return json({ error: "Comment is required" }, 400);
  }

  const comment = await createComment({
    phaseId,
    authorId: session?.user.id ?? null,
    body: bodyText || "Attachment",
    attachmentUrl,
  });

  await notifyAdmins({
    projectId,
    phaseTitle: phase.title,
    authorId: session?.user.id ?? "unknown",
  });

  return json(comment, 200);
}

// Placeholder helpers
declare function getSession(): Promise<Session>;
declare function findProjectWithOwner(projectId: string): Promise<{ id: string; ownerUserId: string } | null>;
declare function findPhase(projectId: string, phaseId: string): Promise<{ id: string; title: string } | null>;
declare function parseBodyAndOptionalAttachment(request: Request): Promise<{ bodyText: string; attachmentUrl: string | null }>;
declare function createComment(input: { phaseId: string; authorId: string | null; body: string; attachmentUrl: string | null }): Promise<unknown>;
declare function notifyAdmins(input: { projectId: string; phaseTitle: string; authorId: string }): Promise<void>;
declare function json(payload: unknown, status: number): Response;
