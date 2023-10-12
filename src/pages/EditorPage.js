import React from "react";
import { useState, useRef, useEffect } from "react";
import ACTIONS from "../Actions";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";

const EditorPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript"); 
  const socketRef = useRef(null);
  const codeRef = useRef(null);

  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }

          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
          // alert("connected");
        }

      );
      

      // Listening for disconnected

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);
  // setClients("harsh");
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }
  // console.log(clients);
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn bg-[#4aee88] hover:bg-[#2b824c] text-black hover:text-white" onClick={copyRoomId}>
          Copy Room Id
        </button>
        <button className="btn leaveBtn text-black hover:text-white" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap ">
        <div className="my-1 flex justify-between">
        <div className="">
          <select
            id="language"
              className="bg-gray-50 px-2  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option selected>Choose language</option>
            <option value="javascript">javascript</option>
            <option value="Cpp">Cpp</option>
            <option value="C">C</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
          </select>
        </div>
          <div className="border-4 px-4 mx-4 rounded-lg bg-white hover:bg-green-950"><PlayArrowRoundedIcon fontSize="large" style={{color:"#2b824c"}} /></div>
        </div>
        <div>
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            selectedLanguage={selectedLanguage}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
