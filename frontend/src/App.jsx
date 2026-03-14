import { useState, useEffect } from 'react'
import './App.css'


function App() {
  const url = import.meta.env.VITE_URL
  const [formdata, setformdata] = useState({
    ambience: "",
    text: ""
  })
  const [prevEntriesst, setprevEntriesst] = useState([])
  const [analysisresult, setanalysisresult] = useState(null)
  const [insightsst, setinsightsst] = useState(null)
  const handlesubmit = async (e) => {
    e.preventDefault()
    if (formdata.ambience != "" && formdata.text.trim() != "") {
      console.log(formdata)
      const req = await fetch(`${url}/api/journal/analyze`,{method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          text: formdata.text
        })
      })
      const data = await req.json()
      console.log(data)
      setanalysisresult(data.result)
      console.log(data.result.keywords[0])
    }

  }

  const savejournal = async()=>{
     const req = await fetch(`${url}/api/journal`,{method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
           userId: localStorage.getItem("userId"),
          ambience: formdata.ambience,
          text: formdata.text,
          result: analysisresult
        })
      })
      const data = await req.json()
      if(data.success){
        prevEntries()
    insights()
      }
  }

  const getUserId = () => {
    console.log("url: ",url)
    if (localStorage.getItem("userId") == null) {
      const userId = crypto.randomUUID()
      localStorage.setItem("userId", userId);
    }
    else {
      console.log("this is uid: ", localStorage.getItem("userId"))
    }
  }

  const prevEntries = async()=>{
    const req = await fetch(`${url}/api/journal/${localStorage.getItem("userId")}`)
    console.log("sent")
    const data = await req.json()
    console.log(data)
    setprevEntriesst(data.preventries)
  }

  const insights = async()=>{
    const req = await fetch(`${url}/api/journal/insights/${localStorage.getItem("userId")}`)
    const data = await req.json()
    console.log(data)
    setinsightsst(data)
  }

  useEffect(() => {
    getUserId()
    prevEntries()
    insights()
  }, [analysisresult])


  return (
    <>
      <div className='w-full min-h-screen h-full  bg-zinc-900 flex flex-col items-center text-zinc-100 gap-10 overflow-x-hidden'>
        <p className=' text-3xl mt-7'>Ai-Journal</p>
        <div className='h-px w-screen border border-zinc-400'></div>
        <form className='flex flex-col items-center ' onSubmit={handlesubmit}>
          <div className='flex gap-2'>
            <label htmlFor="ambience" className=''>Choose ambience:</label>

            <select name="ambience" id="ambience" value={formdata.ambience} className='text-zinc-400' onChange={(e) => setformdata({ ...formdata, ambience: e.target.value })} >
              <option disabled value="">Choose Options</option>
              <option value="forest">Forest</option>
              <option value="ocean">Ocean</option>
              <option value="river">River</option>
              <option value="mountain">Mountain</option>
            </select>
          </div>
          <div className='flex flex-col items-center gap-0.5 mt-5 mb-5'>
            <label htmlFor="journal">Enter the journal:</label>
            <textarea name="journal" id='journal' className='border border-white mt-5 p-2 rounded-xl' placeholder='Today was peaceful...' rows={7} cols={50} onChange={(e) => setformdata({ ...formdata, text: e.target.value })}></textarea>
          </div>
          <input type="submit" value={"Analyze"} className='border border-zinc-100 p-1.5 rounded-xl hover:cursor-pointer' />
        </form>
        <div className='flex flex-col items-center border border-zinc-300 rounded-xl p-3 mb-10 min-h-50 w-100 h-full '>
          <p className='text-2xl'>Analysis result</p>
          {analysisresult?<div className='flex flex-col items-start gap-3'>
            <div>
                    <p className='text-xl'>Emotion</p>
                    <p className='text-zinc-400'>{analysisresult.emotion}</p>
                  </div>
                  <div>
                    <p className='text-xl'>Keywords</p>
                    <div>
                      {analysisresult.keywords&&analysisresult.keywords.length!=0?analysisresult.keywords.map((kw,j)=><p className='text-zinc-400'>{kw}</p>):<p>No keywords</p>}
                    </div>
                  </div>
                  <div >
                    <p className='text-xl'>Summary</p>
                    <p className='text-zinc-400'>{analysisresult.summary}</p>
                  </div>
                  <button onClick={savejournal} className='border border-zinc-100 p-1.5 rounded-xl hover:cursor-pointer'>Save journal</button>
          </div>:<div className='mt-12 text-zinc-300'>Submit a journal to see analysis results</div>}
        </div>
        <div className='border border-zinc-300 rounded-xl p-5 flex flex-col items-center gap-5'>
          <p className='text-xl'>Previous Entries</p>
          {prevEntriesst.length!=0?<>{prevEntriesst.map((item,key)=><div key={key} className='w-full h-full min-w-100  border border-zinc-500 flex flex-col items-start rounded-xl p-3'>
            <div className='w-full flex items-center justify-between mb-3'>
              <p className='border border-zinc-500 p-2 rounded-xl'>{item.ambience}</p>
              <p className='border border-zinc-500 p-2 rounded-xl'>{item.date}</p>
            </div>
            <p className='border border-zinc-500 p-2 rounded-xl mb-3'>{item.emotion}</p>
            <p>"{item.text}"</p>
          </div>)}</>:<p>No previous entries</p>}
        </div>
        <div className='flex flex-col items-center gap-7 border border-zinc-300 rounded-sm p-3 mb-10 min-h-50 min-w-100 w-auto h-full '>
          <p className='text-2xl'>Insights</p>
          {insightsst?<div className='flex flex-col items-center gap-8'>
            <div className='border border-zinc-400 p-4 rounded-xl w-90 flex items-center gap-5'>
              <p className='font-bold'>Total Entries</p>
              <p>{insightsst.totalEntries}</p>
            </div>
            <div className='border border-zinc-400 p-4 rounded-xl w-90 flex items-center gap-5'>
              <p className='font-bold'>Top Emotion</p>
              <p>{insightsst.topEmotion}</p>
            </div>
            <div className='border border-zinc-400 p-4 rounded-xl w-90 flex items-center gap-5'>
              <p className='font-bold'>Most used ambience</p>
              <p>{insightsst.mostUsedAmbience}</p>
            </div>
            <div className='border border-zinc-400 p-4 rounded-xl min-w-90 w-auto flex items-center gap-5'>
              <p className='font-bold'>Recent Keywords</p>
              <div className='flex items-center gap-3'>
                {insightsst.recentKeywords.map((item,key)=><p key={key} className='border border-zinc-500 rounded-2xl py-0.5 px-3'>{item}</p>)}
              </div>
            </div>
          </div>:<div>No insights to display</div>}
        </div>
      </div>
    </>
  )
}

export default App
