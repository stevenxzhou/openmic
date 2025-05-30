import React, {useState} from "react"
import usePerformances from "@/hooks/usePerformances"
import { useGlobalContext } from "@/context/useGlobalContext";
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const SignUpView = ({...props}) => {

  const router = useRouter();
  const eventId = parseInt(props.eventId, 10);

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [socialMedia, setSocialMedia] = useState("")
  const [song1, setSong1] = useState("")
  const [song2, setSong2] = useState("")
  const { performances, addPerformance } = usePerformances(eventId)
  const { user }  = useGlobalContext();
  
  // Add performance handler
  const addPerformanceHandler = () => {
    if ((user.authenticated && !song1) || (!user.authenticated && (!firstName || !lastName || !socialMedia || !song1))) {
      alert("Please fill all fields")
      return
    }

    let newPerformance = {
      event_id: eventId,
      performance_index: (performances.length + 1) * 10,
      songs: [song1, song2],
      status: "PENDING",
      email: user.email,
      first_name: firstName, 
      last_name: lastName, 
      social_media_alias: socialMedia
    }

    addPerformance(newPerformance)
    router.push(`/events/${eventId}/performances/`);
  }

  return (
    <>
    <Header backBtnLink={`/events/${eventId}/performances/`} />
    <div className="p-4">
      <div className="space-y-4">
        { 
          !user.authenticated && (
            <>
              <div>
                <label className="block mb-1 font-medium">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Enter First name"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Enter First name"
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
            </>
          )
        }

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
    </>
)}

export default SignUpView