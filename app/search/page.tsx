"use client";

import { useSearchParams } from "next/navigation";
import SearchProfilesComponent from "@/components/SearchProfile";
import { useQuery } from "@apollo/client";
import { searchProfiles } from "@/services/apollo";
import { HoverEffect } from "@/components/card-hover-effect";
import { BackgroundBeams } from "@/components/background-beams";
import { toHTTP } from "@/utils/ipfs";

const Page: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") ?? undefined;

  const { loading, error, data } = useQuery(searchProfiles, {
    variables: { search: `%${searchQuery}%` },
  });

  const players = data?.player ?? [];
  const formattedData = players.map((player) => {
    const { profile } = player;
    return {
      name: profile.name,
      description: profile.description,
      username: profile.username,
      imageUrl: toHTTP(profile?.profileImageURL ?? ""),
      ethereumAddress: player.ethereumAddress,
      href: `/${player.ethereumAddress}`,
    };
  });
  console.log("searchParams", players);

  return (
    <main>
      <div className="mt-16">
        <SearchProfilesComponent val={searchQuery} />
      </div>
      <div className="max-w-5xl mx-auto px-8">
        <HoverEffect items={formattedData} />
      </div>
      <BackgroundBeams />
    </main>
  );
};

export default Page;
