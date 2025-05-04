import React, {useState} from "react"
import usePerformances from "@/hooks/usePerformances"
import { useRouter } from "next/router"

const SignUpView = () => {

  const router = useRouter();
  const { id } = router.query;
  
  if (!id) {
    return null;
  } 
  const eventId = parseInt(id as string, 10);

  // Form state
  const [name, setName] = useState("")
  const [socialMedia, setSocialMedia] = useState("")
  const [song1, setSong1] = useState("")
  const [song2, setSong2] = useState("")
  const { performances, addPerformance } = usePerformances(eventId)

  // Add performance handler
  const addPerformanceHandler = () => {
    if (!name || !song1 || !song2) {
      alert("Please fill in all fields")
      return
    }
    const newPerformance = {
      event_id: 1,
      event_title: "Summer Festival",
      performance_id: 1,
      performance_index: (performances.length + 1) * 10,
      songs: [song1, song2],
      status: "Upcoming",
      user_id: 1,
      first_name: "",
      social_media_alias: socialMedia,
    }
    addPerformance(newPerformance)
    setName("")
    setSocialMedia("")
    setSong1("")
    setSong2("")
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <a href={`/events/${eventId}/performances`} className="mr-2 text-yellow-600 hover:text-yellow-800">
          ← Back
        </a>
        {/* <h1 className="text-2xl font-bold">Sign Up to Perform</h1> */}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Social Media Handle</label>
          <input
            type="text"
            value={socialMedia}
            onChange={(e) => setSocialMedia(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            placeholder="@yourusername"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Song 1</label>
          <input
            type="text"
            value={song1}
            onChange={(e) => setSong1(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            placeholder="First song"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Song 2 (Optional)</label>
          <input
            type="text"
            value={song2}
            onChange={(e) => setSong2(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            placeholder="Second song (optional)"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
      <button
        onClick={addPerformanceHandler}
        className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
      >
        Complete Sign Up
      </button>
    </div>
    </div>
)}

export default SignUpView