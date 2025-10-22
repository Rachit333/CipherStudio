// "use client";
// import React from "react";
// import firebaseClient, { getIdToken } from "@/lib/firebaseClient";
// import { useAuth } from "@/components/AuthProvider";

// export default function AuthPanel() {
//   const { user, displayName, email, loginWithGitHub, signOut } = useAuth();

//   return (
//     <div className="max-w-sm mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
//       <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
//         User Authentication
//       </h3>

//       {user ? (
//         <div className="space-y-4">
//           <div className="text-gray-700 dark:text-gray-300">
//             Signed in as <strong>{displayName || email}</strong>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm"
//               onClick={() => signOut()}
//             >
//               Sign Out
//             </button>
//             <button
//               className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
//               onClick={async () => {
//                 const token = await getIdToken();
//                 alert(
//                   token
//                     ? "You have an ID token (check network for push)"
//                     : "No token available"
//                 );
//               }}
//             >
//               Show ID Token
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <div className="text-gray-700 dark:text-gray-300">Not signed in</div>
//           <button
//             className="w-full px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors shadow-sm"
//             onClick={() => loginWithGitHub().catch((e) => alert(String(e)))}
//           >
//             Sign in with GitHub
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

"use client"
import React from "react"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"

export default function AuthPanel() {
  const { user, displayName, email, loginWithGitHub, signOut } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (user) {
      try {
        router.replace("/")
      } catch (err) {
        console.warn("Redirect to home failed", err)
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-white px-8 py-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600 text-sm mt-1">Secure access with GitHub</p>
          </div>
          <div className="px-8 py-8">
            {user ? (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">Signed in as</p>
                  <p className="text-gray-900 text-lg font-semibold truncate">{displayName || email}</p>
                  {displayName && email && <p className="text-gray-600 text-sm mt-2 truncate">{email}</p>}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => signOut()}
                    className="w-full px-5 py-3 rounded-lg bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition-colors duration-200 active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium">Not signed in</p>
                  <p className="text-gray-600 text-sm mt-1">Sign in with GitHub to continue</p>
                </div>
                <button
                  onClick={() => loginWithGitHub().catch((e) => alert(String(e)))}
                  className="w-full px-6 py-4 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors duration-200 active:scale-95 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.557.636-1.914-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.191 20 14.434 20 10.017 20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sign in with GitHub
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
