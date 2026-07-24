// import MainClient from "./main-client";
// export default function Home() {
//   return (
//     <>
//       <MainClient />
//     </>
//   );

// }
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/music");
}
