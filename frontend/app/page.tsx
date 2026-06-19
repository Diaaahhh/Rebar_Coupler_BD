import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 py-12 px-6">
      

        <div className="space-y-10">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300">
            <Image
              src="/one.jpeg"
              alt="Coupler Image One"
              width={1500}
              height={1000}
              className="w-full h-auto"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300">
            <Image
              src="/two.jpeg"
              alt="Coupler Image Two"
              width={1500}
              height={1000}
              className="w-full h-auto"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300">
            <Image
              src="/three.jpeg"
              alt="Coupler Image Three"
              width={1500}
              height={1000}
              className="w-full h-auto"
            />
          </div>
        </div>
      
    </main>
  );
}