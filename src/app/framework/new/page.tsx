"use client";

import PasswordGate from "@/components/PasswordGate";
import RiskItemForm from "@/components/RiskItemForm";

export default function NewRiskItemPage() {
  return (
    <PasswordGate>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Add Risk Framework Item
        </h1>
        <RiskItemForm mode="new" />
      </div>
    </PasswordGate>
  );
}
