export async function generateMetadata() {
  return {
    title: "Contest Example Frame",
    // provide a full URL to your /frames endpoint
  };
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white justify-around p-24">
      <p className="text-[5rem] text-black">This is just an example!</p>
    </main>
  );
}
