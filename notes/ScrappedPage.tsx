// import { useState } from "react"
// import {
//     ArrowLeft,
//     User,
//     Mail,
//     Lock,
//     MapPin,
//     Calendar,
//     Trophy,
//     Target,
//     Activity,
//     Edit2,
//     Save,
//     X,
//     LogOut,
// } from "lucide-react"

// const ProfilePage = () => {
//     const [isEditing, setIsEditing] = useState(false)
//     const [userData, setUserData] = useState({
//         name: "Alex Runner",
//         email: "alex.runner@example.com",
//         location: "San Francisco, CA",
//         joinDate: "January 2024",
//         bio: "Passionate runner training for my first marathon. Love trail running and exploring new routes!",
//         avatar: "AR",
//     })

//     const [editData, setEditData] = useState({ ...userData })

//     const stats = {
//         totalRuns: 127,
//         totalDistance: "543.2 km",
//         totalTime: "67h 23m",
//         avgPace: "5:45 /km",
//         longestRun: "32.5 km",
//         achievements: 12,
//     }

//     const recentRuns = [
//         {
//             id: 1,
//             distance: "10.5 km",
//             time: "58:23",
//             pace: "5:34 /km",
//             date: "Nov 12, 2025",
//         },
//         {
//             id: 2,
//             distance: "8.2 km",
//             time: "45:12",
//             pace: "5:31 /km",
//             date: "Nov 10, 2025",
//         },
//         {
//             id: 3,
//             distance: "15.0 km",
//             time: "1:28:45",
//             pace: "5:55 /km",
//             date: "Nov 8, 2025",
//         },
//     ]

//     // const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     //     setEditData({ ...editData, [e.target.name]: e.target.value })
//     // }

//     const handleSave = () => {
//         setUserData({ ...editData })
//         setIsEditing(false)
//     }

//     const handleCancel = () => {
//         setEditData({ ...userData })
//         setIsEditing(false)
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white p-6 relative overflow-hidden">
//             {/* Animated background elements */}
//             <div className="absolute inset-0">
//                 <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
//                 <div
//                     className="absolute top-40 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
//                     style={{ animationDelay: "1s" }}
//                 />
//                 <div
//                     className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
//                     style={{ animationDelay: "2s" }}
//                 />
//             </div>

//             {/* Back to Home Link */}
//             <a
//                 href="/"
//                 className="absolute top-8 left-8 flex items-center gap-2 text-emerald-200 hover:text-emerald-100 transition-colors duration-300 group z-10"
//             >
//                 <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
//                 <span className="font-medium">Dashboard</span>
//             </a>

//             {/* Logout Button */}
//             <button
//                 onClick={() => alert("Logged out (demo)")}
//                 className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all duration-300 z-10"
//             >
//                 <LogOut className="w-4 h-4" />
//                 <span className="font-medium">Logout</span>
//             </button>

//             {/* Main Content */}
//             <div className="relative z-10 max-w-6xl mx-auto mt-24">
//                 <div className="grid md:grid-cols-3 gap-6">
//                     {/* Left Column - Profile Info */}
//                     <div className="md:col-span-1">
//                         <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
//                             {/* Avatar */}
//                             <div className="text-center mb-6">
//                                 <div className="inline-block relative">
//                                     <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-4xl font-bold">
//                                         {userData.avatar}
//                                     </div>
//                                     <button className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors">
//                                         <Edit2 className="w-4 h-4" />
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Edit Toggle */}
//                             <div className="flex justify-center gap-2 mb-6">
//                                 {!isEditing ? (
//                                     <button
//                                         onClick={() => setIsEditing(true)}
//                                         className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 hover:bg-emerald-500/30 transition-all"
//                                     >
//                                         <Edit2 className="w-4 h-4" />
//                                         Edit Profile
//                                     </button>
//                                 ) : (
//                                     <>
//                                         <button
//                                             onClick={handleSave}
//                                             className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-xl text-white hover:bg-emerald-600 transition-all"
//                                         >
//                                             <Save className="w-4 h-4" />
//                                             Save
//                                         </button>
//                                         <button
//                                             onClick={handleCancel}
//                                             className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-all"
//                                         >
//                                             <X className="w-4 h-4" />
//                                             Cancel
//                                         </button>
//                                     </>
//                                 )}
//                             </div>

//                             {/* Profile Details */}
//                             <div className="space-y-4">
//                                 {/* Name */}
//                                 <div>
//                                     <label className="block text-sm text-emerald-300 mb-1">
//                                         Name
//                                     </label>
//                                     {isEditing ? (
//                                         <input
//                                             type="text"
//                                             name="name"
//                                             value={editData.name}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                         />
//                                     ) : (
//                                         <div className="flex items-center gap-2 text-white">
//                                             <User className="w-4 h-4 text-emerald-400" />
//                                             {userData.name}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Email */}
//                                 <div>
//                                     <label className="block text-sm text-emerald-300 mb-1">
//                                         Email
//                                     </label>
//                                     {isEditing ? (
//                                         <input
//                                             type="email"
//                                             name="email"
//                                             value={editData.email}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                         />
//                                     ) : (
//                                         <div className="flex items-center gap-2 text-white">
//                                             <Mail className="w-4 h-4 text-emerald-400" />
//                                             {userData.email}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Location */}
//                                 <div>
//                                     <label className="block text-sm text-emerald-300 mb-1">
//                                         Location
//                                     </label>
//                                     {isEditing ? (
//                                         <input
//                                             type="text"
//                                             name="location"
//                                             value={editData.location}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                         />
//                                     ) : (
//                                         <div className="flex items-center gap-2 text-white">
//                                             <MapPin className="w-4 h-4 text-emerald-400" />
//                                             {userData.location}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Join Date */}
//                                 <div>
//                                     <label className="block text-sm text-emerald-300 mb-1">
//                                         Member Since
//                                     </label>
//                                     <div className="flex items-center gap-2 text-white">
//                                         <Calendar className="w-4 h-4 text-emerald-400" />
//                                         {userData.joinDate}
//                                     </div>
//                                 </div>

//                                 {/* Bio */}
//                                 <div>
//                                     <label className="block text-sm text-emerald-300 mb-1">
//                                         Bio
//                                     </label>
//                                     {isEditing ? (
//                                         <textarea
//                                             name="bio"
//                                             value={editData.bio}
//                                             onChange={handleInputChange}
//                                             rows={4}
//                                             className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                                         />
//                                     ) : (
//                                         <p className="text-emerald-100 text-sm leading-relaxed">
//                                             {userData.bio}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Column - Stats & Activity */}
//                     <div className="md:col-span-2 space-y-6">
//                         {/* Stats Grid */}
//                         <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
//                             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                                 <Activity className="w-6 h-6 text-emerald-400" />
//                                 Running Statistics
//                             </h2>
//                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                                 <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                                     <div className="text-3xl font-bold text-emerald-300 mb-1">
//                                         {stats.totalRuns}
//                                     </div>
//                                     <div className="text-sm text-emerald-200">
//                                         Total Runs
//                                     </div>
//                                 </div>
//                                 <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                                     <div className="text-3xl font-bold text-teal-300 mb-1">
//                                         {stats.totalDistance}
//                                     </div>
//                                     <div className="text-sm text-emerald-200">
//                                         Total Distance
//                                     </div>
//                                 </div>
//                                 <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                                     <div className="text-3xl font-bold text-cyan-300 mb-1">
//                                         {stats.totalTime}
//                                     </div>
//                                     <div className="text-sm text-emerald-200">
//                                         Total Time
//                                     </div>
//                                 </div>
//                                 <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                                     <div className="text-3xl font-bold text-emerald-300 mb-1">
//                                         {stats.avgPace}
//                                     </div>
//                                     <div className="text-sm text-emerald-200">
//                                         Avg Pace
//                                     </div>
//                                 </div>
//                                 <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                                     <div className="text-3xl font-bold text-teal-300 mb-1">
//                                         {stats.longestRun}
//                                     </div>
//                                     <div className="text-sm text-emerald-200">
//                                         Longest Run
//                                     </div>
//                                 </div>
//                                 <div className="bg-white/5 rounded-xl p-4 border border-white/10">
//                                     <div className="text-3xl font-bold text-cyan-300 mb-1">
//                                         {stats.achievements}
//                                     </div>
//                                     <div className="text-sm text-emerald-200">
//                                         Achievements
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Recent Runs */}
//                         <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
//                             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                                 <Target className="w-6 h-6 text-emerald-400" />
//                                 Recent Runs
//                             </h2>
//                             <div className="space-y-3">
//                                 {recentRuns.map((run) => (
//                                     <div
//                                         key={run.id}
//                                         className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
//                                     >
//                                         <div className="flex justify-between items-center">
//                                             <div>
//                                                 <div className="text-lg font-bold text-white">
//                                                     {run.distance}
//                                                 </div>
//                                                 <div className="text-sm text-emerald-300">
//                                                     {run.date}
//                                                 </div>
//                                             </div>
//                                             <div className="text-right">
//                                                 <div className="text-emerald-300 font-semibold">
//                                                     {run.time}
//                                                 </div>
//                                                 <div className="text-sm text-emerald-200">
//                                                     {run.pace}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                             <button className="w-full mt-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold hover:bg-emerald-500/30 transition-all">
//                                 View All Runs
//                             </button>
//                         </div>

//                         {/* Achievements */}
//                         <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
//                             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//                                 <Trophy className="w-6 h-6 text-yellow-400" />
//                                 Achievements
//                             </h2>
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                 {[
//                                     "First 5K",
//                                     "100K Club",
//                                     "Speed Demon",
//                                     "Early Bird",
//                                 ].map((achievement, idx) => (
//                                     <div
//                                         key={idx}
//                                         className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30 text-center"
//                                     >
//                                         <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
//                                         <div className="text-sm font-semibold text-yellow-100">
//                                             {achievement}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ProfilePage
