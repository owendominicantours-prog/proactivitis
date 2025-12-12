"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

type ZoneOption = {
  name: string;
  slug: string;
  countrySlug: string;
};

type Props = {
  current: string;
  zones: ZoneOption[];
};

export function ZoneSelector({ current, zones }: Props) {
  const router = useRouter();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const url = `/destinations/${zones.find((zone) => zone.slug === event.target.value)?.countrySlug}/${event.target.value}`;
      router.push(url);
    },
    [router, zones]
  );

  return (
    <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
      Elige una zona
      <select
        value={current}
        onChange={handleChange}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900"
      >
        <option value="">Ver todas</option>
        {zones.map((zone) => (
          <option key={zone.slug} value={zone.slug}>
            {zone.name}
          </option>
        ))}
      </select>
    </label>
  );
}
