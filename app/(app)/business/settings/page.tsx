 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AuthGuard } from "@/app/context/authGuard";
import {
  businessService,
  BusinessData,
  BusinessUpsert,
} from "@/app/services/businessService";
import {
  userService,
  UserData,
  UserUpdateData,
} from "@/app/services/userService";
import { UserRole } from "@/app/lib/auth";
import Breadcrumbs from "@/app/components/Breadcrumbs";

function getBusinessId(business: BusinessData) {
  return business.id ?? business._id ?? "";
}

function getUserId(user: UserData) {
  return user.id ?? user._id ?? "";
}

const roleOptions: UserRole[] = ["OWNER", "MANAGER", "EMPLOYEE"];

export default function BusinessSettingsPage() {
  const queryClient = useQueryClient();
  const [businessPage, setBusinessPage] = useState(0);
  const businessPageSize = 10;
  const [userPage, setUserPage] = useState(0);
  const userPageSize = 10;
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [businessDraft, setBusinessDraft] = useState<BusinessUpsert>({
    name: "",
    location: "",
    numberOfMachines: 0,
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userDraft, setUserDraft] = useState<UserUpdateData>({
    username: "",
    role: "MANAGER",
    businessId: "",
  });

  const {
    data: businessPageData,
    isLoading: businessesLoading,
    error: businessesError,
  } = useQuery({
    queryKey: ["businesses", businessPage, businessPageSize],
    queryFn: () => businessService.getBusinessesPage(businessPage, businessPageSize),
    placeholderData: keepPreviousData,
  });

  const businesses = businessPageData?.items ?? [];

  const {
    data: userPageData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users", userPage, userPageSize],
    queryFn: () => userService.getUsersPage(userPage, userPageSize),
    placeholderData: keepPreviousData,
  });

  const users = userPageData?.items ?? [];

  const updateBusinessMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: BusinessUpsert }) =>
      businessService.updateBusiness(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["businesses", businessPage, businessPageSize],
      });
      setEditingBusinessId(null);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateData }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUserId(null);
    },
  });

  const businessOptions = useMemo(
    () =>
      businesses.map((business) => ({
        id: getBusinessId(business),
        name: business.name,
      })),
    [businesses]
  );

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
      <div className="space-y-8">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Business Settings" },
          ]}
        />
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Business Settings
              </h1>
              <p className="text-sm text-slate-500">
                Manage your business details and team access.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              href="/business/settings/add-business"
            >
              Add Business
            </Link>
          </div>

          {businessesLoading && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading businesses...
            </div>
          )}
          {businessesError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Failed to load businesses.
            </div>
          )}

          {!businessesLoading && !businessesError && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 md:grid-cols-[2fr_2fr_1fr_140px]">
                <span>Name</span>
                <span>Location</span>
                <span>Machines</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-slate-200">
                {businesses.length === 0 && (
                  <div className="px-4 py-6 text-sm text-slate-500">
                    No businesses found yet.
                  </div>
                )}
                {businesses?.map((business) => {
                  const id = getBusinessId(business);
                  const rowKey =
                    id || `${business.name}-${business.location}`;
                  const isEditing = editingBusinessId === id;
                  return (
                    <div key={rowKey}>
                      <div className="space-y-3 px-4 py-4 text-sm md:hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">
                              Business
                            </p>
                            {isEditing ? (
                              <input
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                value={businessDraft.name}
                                onChange={(event) =>
                                  setBusinessDraft((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <p className="text-base font-semibold text-slate-900">
                                {business.name}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {business.numberOfMachines} machines
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Location
                          </p>
                          {isEditing ? (
                            <input
                              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={businessDraft.location}
                              onChange={(event) =>
                                setBusinessDraft((prev) => ({
                                  ...prev,
                                  location: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            <p className="text-sm text-slate-600">
                              {business.location}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isEditing ? (
                            <>
                              <input
                                type="number"
                                min={0}
                                className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
                                value={businessDraft.numberOfMachines}
                                onChange={(event) =>
                                  setBusinessDraft((prev) => ({
                                    ...prev,
                                    numberOfMachines: Number(event.target.value),
                                  }))
                                }
                              />
                              <button
                                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                onClick={() => setEditingBusinessId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                                onClick={() =>
                                  updateBusinessMutation.mutate({
                                    id: id || null,
                                    data: businessDraft,
                                  })
                                }
                                type="button"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <button
                              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                              onClick={() => {
                                setEditingBusinessId(id);
                                setBusinessDraft({
                                  name: business?.name,
                                  location: business?.location,
                                  numberOfMachines: business?.numberOfMachines,
                                });
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="hidden grid-cols-1 items-center gap-3 px-4 py-4 text-sm md:grid md:grid-cols-[2fr_2fr_1fr_140px]">
                        <div>
                          {isEditing ? (
                            <input
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={businessDraft.name}
                              onChange={(event) =>
                                setBusinessDraft((prev) => ({
                                  ...prev,
                                  name: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="font-medium text-slate-900">
                              {business.name}
                            </span>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={businessDraft.location}
                              onChange={(event) =>
                                setBusinessDraft((prev) => ({
                                  ...prev,
                                  location: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-slate-600">
                              {business.location}
                            </span>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={businessDraft.numberOfMachines}
                              onChange={(event) =>
                                setBusinessDraft((prev) => ({
                                  ...prev,
                                  numberOfMachines: Number(event.target.value),
                                }))
                              }
                            />
                          ) : (
                            <span className="text-slate-600">
                              {business.numberOfMachines}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                onClick={() => setEditingBusinessId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                                onClick={() =>
                                  updateBusinessMutation.mutate({
                                    id: id || null,
                                    data: businessDraft,
                                  })
                                }
                                type="button"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <button
                              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                              onClick={() => {
                                setEditingBusinessId(id);
                                setBusinessDraft({
                                  name: business?.name,
                                  location: business?.location,
                                  numberOfMachines: business?.numberOfMachines,
                                });
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Page {(businessPageData?.page ?? 0) + 1} of{" "}
                  {businessPageData?.totalPages ?? 1}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    onClick={() => setBusinessPage((prev) => Math.max(prev - 1, 0))}
                    disabled={(businessPageData?.page ?? 0) === 0}
                    type="button"
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    onClick={() =>
                      setBusinessPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.max((businessPageData?.totalPages ?? 1) - 1, 0)
                        )
                      )
                    }
                    disabled={
                      (businessPageData?.totalPages ?? 1) <= 1 ||
                      (businessPageData?.page ?? 0) >=
                        (businessPageData?.totalPages ?? 1) - 1
                    }
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Team Members
              </h2>
              <p className="text-sm text-slate-500">
                Manage access for managers and employees.
              </p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              href="/business/settings/add-user"
            >
              Add User
            </Link>
          </div>

          {usersLoading && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading users...
            </div>
          )}
          {usersError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Failed to load users.
            </div>
          )}

          {!usersLoading && !usersError && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 md:grid-cols-[2fr_1fr_2fr_140px]">
                <span>Username</span>
                <span>Role</span>
                <span>Business</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-slate-200">
                {users.length === 0 && (
                  <div className="px-4 py-6 text-sm text-slate-500">
                    No users added yet.
                  </div>
                )}
                {users?.map((user) => {
                  const id = getUserId(user);
                  const isEditing = editingUserId === id;
                  const businessLabel =
                    user?.business?.name ??
                    user?.businessId ??
                    "Unassigned";
                  return (
                    <div key={id || user.username}>
                      <div className="space-y-3 px-4 py-4 text-sm md:hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">
                              User
                            </p>
                            {isEditing ? (
                              <input
                                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                value={userDraft?.username ?? ""}
                                onChange={(event) =>
                                  setUserDraft((prev) => ({
                                    ...prev,
                                    username: event.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <p className="text-base font-semibold text-slate-900">
                                {user?.username}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {user?.role}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            Business
                          </p>
                          {isEditing ? (
                            <select
                              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={userDraft.businessId ?? ""}
                              onChange={(event) =>
                                setUserDraft((prev) => ({
                                  ...prev,
                                  businessId: event.target.value,
                                }))
                              }
                            >
                              <option value="">Unassigned</option>
                              {businessOptions.map((business) => (
                                <option key={business.id} value={business.id}>
                                  {business.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-sm text-slate-600">
                              {businessLabel}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isEditing ? (
                            <>
                              <select
                                className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
                                value={userDraft?.role}
                                onChange={(event) =>
                                  setUserDraft((prev) => ({
                                    ...prev,
                                    role: event.target.value as UserRole,
                                  }))
                                }
                              >
                                {roleOptions.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                onClick={() => setEditingUserId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                                onClick={() =>
                                  updateUserMutation.mutate({
                                    id,
                                    data: userDraft,
                                  })
                                }
                                type="button"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <button
                              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                              onClick={() => {
                                const businessId =
                                  user.businessId ??
                                  user.business?.id ??
                                  user.business?._id ??
                                  "";
                                setEditingUserId(id);
                                setUserDraft({
                                  username: user.username,
                                  role: user.role,
                                  businessId,
                                });
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="hidden grid-cols-1 items-center gap-3 px-4 py-4 text-sm md:grid md:grid-cols-[2fr_1fr_2fr_140px]">
                        <div>
                          {isEditing ? (
                            <input
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={userDraft?.username ?? ""}
                              onChange={(event) =>
                                setUserDraft((prev) => ({
                                  ...prev,
                                  username: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            <span className="font-medium text-slate-900">
                              {user?.username}
                            </span>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <select
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={userDraft?.role}
                              onChange={(event) =>
                                setUserDraft((prev) => ({
                                  ...prev,
                                  role: event.target.value as UserRole,
                                }))
                              }
                            >
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-600">{user?.role}</span>
                          )}
                        </div>
                        <div>
                          {isEditing ? (
                            <select
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              value={userDraft.businessId ?? ""}
                              onChange={(event) =>
                                setUserDraft((prev) => ({
                                  ...prev,
                                  businessId: event.target.value,
                                }))
                              }
                            >
                              <option value="">Unassigned</option>
                              {businessOptions.map((business) => (
                                <option key={business.id} value={business.id}>
                                  {business.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-600">
                              {businessLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                onClick={() => setEditingUserId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500"
                                onClick={() =>
                                  updateUserMutation.mutate({
                                    id,
                                    data: userDraft,
                                  })
                                }
                                type="button"
                              >
                                Save
                              </button>
                            </>
                          ) : (
                            <button
                              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                              onClick={() => {
                                const businessId =
                                  user.businessId ??
                                  user.business?.id ??
                                  user.business?._id ??
                                  "";
                                setEditingUserId(id);
                                setUserDraft({
                                  username: user.username,
                                  role: user.role,
                                  businessId,
                                });
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Page {(userPageData?.page ?? 0) + 1} of{" "}
                  {userPageData?.totalPages ?? 1}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    onClick={() => setUserPage((prev) => Math.max(prev - 1, 0))}
                    disabled={(userPageData?.page ?? 0) === 0}
                    type="button"
                  >
                    Prev
                  </button>
                  <button
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    onClick={() =>
                      setUserPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.max((userPageData?.totalPages ?? 1) - 1, 0)
                        )
                      )
                    }
                    disabled={
                      (userPageData?.totalPages ?? 1) <= 1 ||
                      (userPageData?.page ?? 0) >=
                        (userPageData?.totalPages ?? 1) - 1
                    }
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AuthGuard>
  );
}
