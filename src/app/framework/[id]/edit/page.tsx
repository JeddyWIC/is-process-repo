"use client";

import { useEffect, useState, use } from "react";
import PasswordGate from "@/components/PasswordGate";
import RiskItemForm, { RiskItemFormData } from "@/components/RiskItemForm";

export default function EditRiskItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [item, setItem] = useState<RiskItemFormData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/framework/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setItem({
          id: data.id,
          type: data.type,
          title: data.title,
          description: data.description || "",
          effects: data.effects || [],
          phases: data.phases || [],
          notes: data.notes || "",
        });
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  return (
    <PasswordGate>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Risk Framework Item
        </h1>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            {error}
          </div>
        )}
        {item ? (
          <RiskItemForm mode="edit" initial={item} />
        ) : !error ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : null}
      </div>
    </PasswordGate>
  );
}
