import Authors from "@/components/feed/authors/Authors";
import LogoutButton from "@/components/LogoutButton";
import RedirectButton from "@/components/Properties";

export default function Home() {
  return (
    <main>
      <div>
        <Authors />
        <div className="flex gap-4 m-12">
          <LogoutButton />
          <RedirectButton label={"Properties"} redirect="map/properties" />
        </div>
      </div>
    </main>
  );
}
