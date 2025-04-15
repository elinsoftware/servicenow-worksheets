import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"
import logo from '../assets/logo-sm.png'

const luckyCss = {
  margin: '0px',
  // padding: '50px 0px 0px 0px',
  // position: 'relative',
  width: '100%',
  height: '100%',
  left: '0px',
  top: '0px'
}

export default function App() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState(null);
  const [sys_id, setSys_id] = useState(null); // if sys_id = -1 then new record
  const [isModified, setIsModified] = useState(false);
  const [worksheet_name, setWorksheet_name] = useState('');
  const [isManual, setIsManual] = useState(false);

  function getData(sys_id){
    axios.get('/api/now/table/x_elsr_flare_wsh_worksheet/'+sys_id).then((response) => {
      // setData(JSON.parse(response.data.result.data))
      setName(response.data.result.name)
      setNumber(response.data.result.number)
      window.luckysheet.create({...JSON.parse(response.data.result.data), hook: {
        updated: function (operate) {
            console.log("updated!", operate);
            setIsModified(true)
        }
       }})
    })
  }

  useEffect(() => {
 
    const urlParams = new URLSearchParams(decodeURIComponent(window.location.search))
    let sys_id = urlParams.get('sys_id')
    let action = urlParams.get('action')
    // console.log('worksheet check:',window.parent.location,window.parent.location.pathname.indexOf('%3Faction%3Dmanual')>0)
    if (window.parent.location.pathname.indexOf('%3Faction%3Dmanual')>0) {
      console.log('manual mode triggered')
      setIsManual(true)
      return
    }
    if (action=='manual') {
      setIsManual(true)
      return
    }
    if (!sys_id && !action) {
      console.warn('no "sys_id" and "action" params found in url')
      return;
    }
    setSys_id(sys_id)
    console.log('sys_id:',sys_id)
    if (process.env.NODE_ENV === 'development') {
      const username = import.meta.env.VITE_REACT_APP_USER
      const password = import.meta.env.VITE_REACT_APP_PASSWORD
      axios.defaults.auth = {
        username,
        password,
      }
      console.log('DEV MODE - set default username and password ',axios.defaults.auth)
      if (sys_id!=='-1') getData(sys_id)
    } else {
      axios.get('/api/x_elsr_flare_wsh/flare_worksheets/gettoken')
        .then( r =>{
          axios.defaults.headers['X-userToken'] = r.data.result.token
          console.log('PROD MODE - recieved ServiceNow token: ',r.data.result.token)
        })
        .then(() => {
          if (sys_id!=='-1') getData(sys_id)
        })
    }
  
  }, [])

  function createWorksheet(){
    axios.post('/api/now/table/x_elsr_flare_wsh_worksheet', {
      name: worksheet_name,
    })
    .then((response) => {
      console.log('create response:',response)
      setSys_id(response.data.result.sys_id)
      setTimeout(() => {
        setName(response.data.result.name)
        setNumber(response.data.result.number)
        window.luckysheet.create({...JSON.parse(response.data.result.data), hook: {
          updated: function (operate) {
              console.log("updated!", operate);
              setIsModified(true)
          }
        }})
      }, 100);

    })
  }

  function SaveData(){
    console.log(luckysheet.toJson())
    axios.patch('/api/now/table/x_elsr_flare_wsh_worksheet/'+sys_id, {
      data: JSON.stringify(luckysheet.toJson()),
      name: name,
    })
    .then((response) => {
      console.log('save response:',response)
      setIsModified(false)
    })
  }
  return (<>
            <div style={{width:"100vw",height:"100vh"}}>
              {number && <div className="worksheets-header ">
                <div className="flex w-3/4 items-center ">
                  <div className="worksheets-header-number">{number}</div>
                  <div className="w-3/4">
                    <input
                      type="text"
                      className="block w-full ml-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={isModified?"w-20 ml-4 text-red-600 text-sm":"w-20 ml-4 text-green-600 text-sm"}>
                    {isModified?"Modified":"Saved"}
                  </div>
                </div>
                <div>
                <button
                  type="button"
                  className="rounded-md ml-4 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => SaveData()}
                  >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-md ml-2 mr-2 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => window.parent.location.href = '/x_elsr_flare_wsh_worksheet_list.do'}
                >
                  Cancel
                </button>
                </div>
              </div>}
              {sys_id!=-1 && !isManual &&<div
                    id="luckysheet"
                    style={luckyCss}
                    ></div>}
              {sys_id==-1 && 
                <main className="grid min-h-full place-items-center bg-white px-6 lg:px-8" style={{marginTop:"-80px"}}>
                <div className="text-center">
                  <img className="mx-auto h-12 w-auto" src={logo} alt="Flare" />
                  <p className="text-base font-semibold text-indigo-600">Flare</p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">New Worksheet</h1>
                  <p className="mt-6 text-base leading-7 text-gray-600">Create advanced data tables and worksheets with a single click.</p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                  <div className="flex gap-x-4">
                    <input
                      name="worksheet_name"
                      className="w-80 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Enter worksheet name"
                      value={worksheet_name}
                      onChange={(e) => setWorksheet_name(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-300 flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      disabled={worksheet_name==''?true:false}
                      onClick={() => createWorksheet()}
                    >
                    Create
                    </button>
                  </div>
                  </div>
                </div>
              </main>
              }
              {isManual && <div>
                <article className="prose p-10">
                <h1>Flare Worksheets</h1>
                <p>
                Flare Worksheets is an application for creating and managing Excel-like worksheets in ServiceNow.
                </p>
                <h2>Features</h2>  
                <ul>
                  <li>Create and modify worksheets with table data</li>
                  <li>Format rows and columns</li>
                  <li>Use basic functions</li>
                </ul>
                <h3>Limitations</h3>
                <p>This is a basic FREE version of the application that has some limitations:</p>
                <ul>
                  <li>Max rows: 200</li>
                  <li>Max columns: 52</li>
                  <li>One data sheet per Worksheet</li>
                  <li>Worksheet visibility limited to a creator of the Worksheet</li>

                </ul>
                <h2>Additional information</h2>
                <p>Additional information about the Flare Worksheets and other applications can be found at <a href="https://flaredev.io/apps" target="_blank">Flaredev.io</a></p>
               
                <h2>Support</h2>  
                <p>
                For support questions and requests, please contact <a href="mailto:worksheets@flaredev.io">worksheets@flaredev.io</a>
                </p>
                <p className="text-xs text-gray-300">Open-souce license data can be found in x_elsr_flare_wsh.licenses system property in ServiceNow.</p>
                  </article>
                </div>}
            </div>
    </>
  );
}
