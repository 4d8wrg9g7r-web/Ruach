import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckSquare, Home, Link2, Map, Trash2, Undo2, Users2, X, Zap } from "lucide-react";
import { groupService, isOverdue, journeyService, peopleService, personDisplayName, taskService } from "@ruach/database";
import { websiteService } from "@ruach/database";
import { Badge } from "../../../../components/ui/Badge";
import { buttonClasses } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Input, Select } from "../../../../components/ui/Input";
import { PersonForm } from "../../../../components/PersonForm";
import {
  HOUSEHOLD_ROLE_OPTIONS,
  RELATIONSHIP_TYPE_OPTIONS,
  householdRoleLabel,
  membershipStatusLabel,
  membershipStatusTone,
  relationshipTypeLabel,
} from "../../../../lib/people-format";
import { canPeople, requirePeople } from "../../../../lib/people-access";
import { canGroups } from "../../../../lib/groups-access";
import { canTasks } from "../../../../lib/tasks-access";
import { canJourneys } from "../../../../lib/journeys-access";
import { groupTypeLabel } from "../../../../lib/groups-format";
import { getCurrentOrganization } from "../../../../lib/session";
import {
  addRelationshipAction,
  archivePersonAction,
  removeRelationshipAction,
  restorePersonAction,
  setHouseholdAction,
  updatePersonAction,
} from "../actions";

export default async function PersonDetailPage({ params }: { params: Promise<{ personId: string }> }) {
  const organization = await getCurrentOrganization();
  if (!organization) return null;
  await requirePeople(organization.id, "person.view");
  const canManage = await canPeople(organization.id, "person.manage");

  const { personId } = await params;
  const person = await peopleService.getPerson(organization.id, personId);
  if (!person) notFound();

  const [campuses, households, allPeople] = await Promise.all([
    websiteService.listWebsites(organization.id),
    peopleService.listHouseholds(organization.id),
    // v1: a bounded select rather than autocomplete. 200 is well past any small church's
    // roster; larger orgs get search-based relationship linking in a later iteration.
    peopleService.listPeople(organization.id, { take: 200 }),
  ]);
  const otherPeople = allPeople.filter((p) => p.id !== person.id);

  // Groups this person belongs to -- only surfaced if the viewer can also view Groups.
  // A read-only panel; management lives on the group's own page.
  const canViewGroups = await canGroups(organization.id, "group.view");
  const groupMemberships = canViewGroups
    ? await groupService.listGroupsForPerson(organization.id, person.id)
    : [];

  // Open follow-up tasks about this person -- same read-only-panel pattern as Groups.
  const canViewTasks = await canTasks(organization.id, "task.view");
  const personTasks = canViewTasks ? await taskService.listTasksForPerson(organization.id, person.id) : [];

  // Journey enrollments with progress -- same read-only-panel pattern.
  const canViewJourneys = await canJourneys(organization.id, "journey.view");
  const personJourneys = canViewJourneys
    ? await journeyService.listEnrollmentsForPerson(organization.id, person.id)
    : [];

  const boundUpdate = updatePersonAction.bind(null, person.id);
  const boundSetHousehold = setHouseholdAction.bind(null, person.id);
  const boundAddRelationship = addRelationshipAction.bind(null, person.id);
  const boundArchive = archivePersonAction.bind(null, person.id);
  const boundRestore = restorePersonAction.bind(null, person.id);

  return (
    <div>
      <Link href="/people" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink">
        <ArrowLeft size={15} /> Back to People
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{personDisplayName(person)}</h1>
        <Badge variant={membershipStatusTone(person.membershipStatus)}>
          {membershipStatusLabel(person.membershipStatus)}
        </Badge>
        {person.archivedAt && <Badge variant="warning">Archived</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding="md">
            <h2 className="mb-4 text-sm font-semibold text-ink">Profile</h2>
            {canManage ? (
              <PersonForm
                action={boundUpdate}
                person={person}
                campuses={campuses.map((c) => ({ id: c.id, name: c.name }))}
                submitLabel="Save changes"
              />
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <ReadField label="Email" value={person.email} />
                <ReadField label="Phone" value={person.phone} />
                <ReadField label="Preferred name" value={person.preferredName} />
                <ReadField label="Home campus" value={person.campus?.name} />
                <ReadField label="Tags" value={person.tags.join(", ") || null} />
                <ReadField label="Notes" value={person.notes} />
              </dl>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {/* Household */}
          <Card padding="md">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Home size={15} /> Household
            </h2>
            {person.household ? (
              <div className="mb-4">
                <p className="text-sm font-medium text-ink">{person.household.name}</p>
                <p className="text-xs text-ink-muted">
                  {householdRoleLabel(person.householdRole)} · {person.household.members.length}{" "}
                  {person.household.members.length === 1 ? "member" : "members"}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
                  {person.household.members.map((m) => (
                    <li key={m.id}>
                      {m.id === person.id ? (
                        <span className="text-ink">{personDisplayName(m)}</span>
                      ) : (
                        <Link href={`/people/${m.id}`} className="hover:text-accent">
                          {personDisplayName(m)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mb-4 text-sm text-ink-muted">Not in a household.</p>
            )}

            {canManage && (
              <form action={boundSetHousehold} className="space-y-2 border-t border-border pt-3">
                <label className="block text-xs text-ink-secondary">
                  Assign to household
                  <Select name="householdId" defaultValue={person.householdId ?? ""} className="mt-1 text-sm">
                    <option value="">— None —</option>
                    {households.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <Input name="newHouseholdName" placeholder="…or new household name" className="text-sm" />
                <Select name="householdRole" defaultValue={person.householdRole ?? "ADULT"} className="text-sm">
                  {HOUSEHOLD_ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
                <button type="submit" className={buttonClasses("secondary", "sm") + " w-full"}>
                  Update household
                </button>
              </form>
            )}
          </Card>

          {/* Groups -- read-only; composes the Group module via GroupMembership. */}
          {canViewGroups && (
            <Card padding="md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <Users2 size={15} /> Groups
              </h2>
              {groupMemberships.length === 0 ? (
                <p className="text-sm text-ink-muted">Not in any groups.</p>
              ) : (
                <ul className="space-y-2">
                  {groupMemberships.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                      <Link href={`/groups/${m.group.id}`} className="text-ink hover:text-accent">
                        {m.group.name}
                      </Link>
                      <span className="text-xs text-ink-muted">{groupTypeLabel(m.group.type)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* Journeys -- read-only progress; management lives on the journey page. */}
          {canViewJourneys && personJourneys.length > 0 && (
            <Card padding="md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <Map size={15} /> Journeys
              </h2>
              <ul className="space-y-3">
                {personJourneys.map((enrollment) => (
                  <li key={enrollment.id} className="text-sm">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Link href={`/journeys/${enrollment.journeyId}`} className="text-ink hover:text-accent">
                        {enrollment.journey.name}
                      </Link>
                      <span className="text-xs text-ink-muted">
                        {enrollment.status === "COMPLETED"
                          ? "Completed"
                          : enrollment.status === "EXITED"
                            ? "Exited"
                            : enrollment.progress.nextMilestone
                              ? `Next: ${enrollment.progress.nextMilestone.name}`
                              : `${enrollment.progress.percent}%`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${enrollment.progress.percent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Follow-up tasks -- read-only; management lives on /tasks. */}
          {canViewTasks && (
            <Card padding="md">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <CheckSquare size={15} /> Follow-ups
              </h2>
              {personTasks.length === 0 ? (
                <p className="mb-2 text-sm text-ink-muted">No open tasks for this person.</p>
              ) : (
                <ul className="mb-2 space-y-2">
                  {personTasks.map((task) => (
                    <li key={task.id} className="text-sm">
                      <span className="text-ink">{task.title}</span>
                      {task.workflowRunId && <Zap size={11} className="ml-1.5 inline text-accent-dark" />}
                      <span className="block text-xs text-ink-muted">
                        {task.dueAt && (
                          <span className={isOverdue(task) ? "font-medium text-danger" : undefined}>
                            Due {new Date(task.dueAt).toLocaleDateString()}
                          </span>
                        )}
                        {task.dueAt && task.assignee && " · "}
                        {task.assignee && (task.assignee.name || task.assignee.email)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/tasks?person=${person.id}`} className="text-xs text-accent hover:underline">
                View in Tasks →
              </Link>
            </Card>
          )}

          {/* Relationships */}
          <Card padding="md">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <Link2 size={15} /> Relationships
            </h2>
            {person.relationshipsFrom.length === 0 ? (
              <p className="mb-3 text-sm text-ink-muted">No relationships yet.</p>
            ) : (
              <ul className="mb-3 space-y-2">
                {person.relationshipsFrom.map((rel) => (
                  <li key={rel.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      <Link href={`/people/${rel.relatedPersonId}`} className="text-ink hover:text-accent">
                        {personDisplayName(rel.relatedPerson)}
                      </Link>
                      <span className="ml-2 text-xs text-ink-muted">{relationshipTypeLabel(rel.type)}</span>
                    </span>
                    {canManage && (
                      <form action={removeRelationshipAction.bind(null, person.id, rel.relatedPersonId, rel.type)}>
                        <button
                          type="submit"
                          aria-label={`Remove ${personDisplayName(rel.relatedPerson)}`}
                          className="rounded-sm p-1 text-ink-muted hover:bg-surface-muted hover:text-danger"
                        >
                          <X size={14} />
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {canManage && otherPeople.length > 0 && (
              <form action={boundAddRelationship} className="space-y-2 border-t border-border pt-3">
                <Select name="relatedPersonId" defaultValue="" required className="text-sm">
                  <option value="" disabled>
                    Choose a person…
                  </option>
                  {otherPeople.map((p) => (
                    <option key={p.id} value={p.id}>
                      {personDisplayName(p)}
                    </option>
                  ))}
                </Select>
                <Select name="type" defaultValue="OTHER" className="text-sm">
                  {RELATIONSHIP_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
                <button type="submit" className={buttonClasses("secondary", "sm") + " w-full"}>
                  Add relationship
                </button>
              </form>
            )}
          </Card>

          {/* Archive / restore */}
          {canManage && (
            <Card padding="md">
              <h2 className="mb-2 text-sm font-semibold text-ink">Status</h2>
              {person.archivedAt ? (
                <>
                  <p className="mb-3 text-xs text-ink-muted">
                    Archived {new Date(person.archivedAt).toLocaleDateString()}. History is preserved.
                  </p>
                  <form action={boundRestore}>
                    <button type="submit" className={buttonClasses("secondary", "sm") + " w-full"}>
                      <Undo2 size={14} /> Restore person
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="mb-3 text-xs text-ink-muted">
                    Archiving hides this person from lists without deleting their record.
                  </p>
                  <form action={boundArchive}>
                    <button type="submit" className={buttonClasses("danger", "sm") + " w-full"}>
                      <Trash2 size={14} /> Archive person
                    </button>
                  </form>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink">{value || "—"}</dd>
    </div>
  );
}
