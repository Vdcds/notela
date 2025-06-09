import Navbar from "@/components/Navbar";
export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-500 flex-col  ">
      <h1 className="text-white text-4xl p-s ">Hello Notela!</h1>
      <p className="text-base text-blue-100 italic">Notela is my own little solution for my ever growing need for notes and story draft stroage. </p>
      <Navbar />
    </div>
  );
}
