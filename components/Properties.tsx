"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/authStore";
import Loading from "./loader/Loading";
import clsx from "clsx";

type RedirectButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  redirect: string;
  label: string | JSX.Element;
};

export default function RedirectButton(props: RedirectButtonProps) {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("User after logout: ", user);
  });

  const handleRedirectProperties = async () => {
    setLoading(true);
    try {
      router.replace(`/${user.organization.slug}/${props.redirect}`);
    } catch (error) {
      console.error("Redirect Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.id || loading) {
    return <Loading />;
  }

  return (
    <button
      onClick={handleRedirectProperties}
      disabled={loading}
      className={clsx(
        `${
          loading ? "bg-slate-700" : "bg-blue-700"
        }`, props.className ?? `px-4 py-2 text-sm font-medium text-white  rounded-md hover:bg-blue-600 focus:outline-none disabled:opacity-50`
      )}
    >
      {props.label}
    </button>
  );
}
