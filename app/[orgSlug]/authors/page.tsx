import Authors from "@/components/feed/authors/Authors";
import LogoutButton from "@/components/LogoutButton";

export default function Home() {
  return (
    <main>
      <Authors />
      <LogoutButton />
    </main>
  );
}
