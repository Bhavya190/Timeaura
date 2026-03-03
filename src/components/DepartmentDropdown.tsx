"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Check, ChevronDown, Loader2 } from "lucide-react";
import { Department } from "@/types";
import { fetchDepartmentsAction, createDepartmentAction } from "@/app/actions";
import { toast } from "react-hot-toast";

interface Props {
    selectedId?: number;
    onSelect: (dept: Department) => void;
}

export default function DepartmentDropdown({ selectedId, onSelect }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchDepartmentsAction();
            setDepartments(data);
            setLoading(false);
        };
        if (open) load();
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedDept = departments.find((d) => d.id === selectedId);

    const handleCreate = async () => {
        if (!search.trim()) return;
        setCreating(true);
        const result = await createDepartmentAction({ name: search.trim() });
        setCreating(false);

        if ("error" in result) {
            toast.error(result.error as string);
        } else {
            toast.success(`Department "${result.name}" created!`);
            setDepartments([...departments, result]);
            onSelect(result);
            setOpen(false);
            setSearch("");
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex w-full items-center justify-between rounded-lg border bg-[#020617] px-4 py-2 text-sm outline-none transition-all ${open ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,1)]" : "border-slate-800 hover:border-slate-700"
                    }`}
            >
                <div className="flex-1 text-left">
                    {open ? (
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Select department"
                            className="bg-transparent outline-none w-full text-slate-100 placeholder:text-slate-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className={selectedDept ? "text-slate-100" : "text-slate-500"}>
                            {selectedDept ? selectedDept.name : "Select department"}
                        </span>
                    )}
                </div>
                <ChevronDown className={`h-4 w-4 text-emerald-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-800 bg-[#0f172a] p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1 scrollbar-thin scrollbar-thumb-slate-700">
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                            </div>
                        ) : filtered.length > 0 ? (
                            filtered.map((dept) => (
                                <button
                                    key={dept.id}
                                    type="button"
                                    onClick={() => {
                                        onSelect(dept);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all ${selectedId === dept.id
                                            ? "bg-slate-800 text-slate-100"
                                            : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
                                        }`}
                                >
                                    <span className="font-medium">{dept.name}</span>
                                    {selectedId === dept.id && <Check className="h-4 w-4 text-emerald-500" />}
                                </button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <p className="text-sm text-slate-500 mb-4 font-medium">No options</p>
                                {search.trim() && (
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={creating}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 text-sm font-bold text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95 mx-auto"
                                    >
                                        {creating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                        Add New Department
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {search.trim() && filtered.length > 0 && !departments.some(d => d.name.toLowerCase() === search.toLowerCase().trim()) && (
                        <div className="border-t border-slate-800 p-2 text-center">
                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={creating}
                                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 text-sm font-bold text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 transition-all active:scale-95 mx-auto"
                            >
                                {creating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Add &quot;{search.trim()}&quot;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
