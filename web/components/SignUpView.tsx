import React from "react"

type SignUpViewProps = {
  name: string
  setName: (name: string) => void
  socialMedia: string
  setSocialMedia: (socialMedia: string) => void
  song1: string
  setSong1: (song1: string) => void
  song2: string
  setSong2: (song2: string) => void
  addPerformer: () => void
  setView: (view: "status" | "signup" | "list") => void
}

const SignUpView: React.FC<SignUpViewProps> = ({
  name,
  setName,
  socialMedia,
  setSocialMedia,
  song1,
  setSong1,
  song2,
  setSong2,
  addPerformer,
  setView,
}) => (
  <div className="p-4">
    <div className="flex items-center mb-6">
      <button onClick={() => setView("status")} className="mr-2 text-yellow-600 hover:text-yellow-800">
        ← Back
      </button>
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

    <div className="mt-6 space-y-3">
      <button onClick={addPerformer} className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded">
        Complete Sign Up
      </button>
      <button
        onClick={() => setView("list")}
        className="w-full py-2 border border-yellow-300 hover:bg-yellow-50 rounded"
      >
        View Performing List
      </button>
    </div>
  </div>
)

export default SignUpView