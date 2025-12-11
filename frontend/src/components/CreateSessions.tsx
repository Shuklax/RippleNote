import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const CreateSessions = () => {
  const [sessionDetails, setSessionDetails] = useState({
    sessionName: "",
    sessionType: "Podcast",
    noOfParticipants: "2",
    description: "",
    startRecording: true,
    recordingPublic: false,
  });

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        <div
          id="header"
          className="flex justify-between p-6 border border-[#131313] bg-[#060606]"
        >
          <div>
            <p className="text-2xl font-bold">Create Session</p>
            <p className="text-sm text-gray-500">
              Configure and start a new recording session
            </p>
          </div>
        </div>

        <div id="body" className="flex p-6 space-x-36">
          <div id="left-menu" className="flex-[2]">
            <div
              id="left-menu-1"
              className="border border-[#131313] bg-[#060606] p-4 mx-2 my-2 rounded-lg space-y-4"
            >
              <p className="font-semibold text-xl">Session Details</p>
              <div
                id="session-name"
                className="grid w-full max-w-sm items-center gap-3"
              >
                <Label htmlFor="name" className="font-semibold">
                  Session Name*
                </Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="e.g., Podcast Episode #43"
                  value={sessionDetails.sessionName}
                  onChange={(e) =>
                    setSessionDetails({
                      ...sessionDetails,
                      sessionName: e.target.value,
                    })
                  }
                />
              </div>
              <div id="session-type">
                <Label htmlFor="session-type" className="font-semibold">
                  Session Type*
                </Label>
                <Select
                  defaultValue="podcast"
                  value={sessionDetails.sessionType}
                  onValueChange={(value) =>
                    setSessionDetails({
                      ...sessionDetails,
                      sessionType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Podcast"
                      className="text-white font-semibold"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#060606] text-white font-semibold">
                    <SelectItem value="Podcast">Podcast</SelectItem>
                    <SelectItem value="Interview">Interview</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div id="no-of-participants">
                <Label htmlFor="no-of-participants" className="font-semibold">
                  No. Of Participants*
                </Label>
                <Select
                  defaultValue="2"
                  value={sessionDetails.noOfParticipants}
                  onValueChange={(value) =>
                    setSessionDetails({
                      ...sessionDetails,
                      noOfParticipants: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="2 participants"
                      className="text-white font-semibold"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-[#060606] text-white font-semibold">
                    <SelectItem value="2">2 participants</SelectItem>
                    <SelectItem value="4">4 participants</SelectItem>
                    <SelectItem value="8">8 participants</SelectItem>
                    <SelectItem value="16">16 participants</SelectItem>
                    <SelectItem value="20+">20+ participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div id="description">
                <Label htmlFor="description" className="font-semibold">
                  Description
                </Label>
                <Textarea
                  placeholder="Add notes about this session"
                  id="description"
                  value={sessionDetails.description}
                  onChange={(e) =>
                    setSessionDetails({
                      ...sessionDetails,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div
              id="left-menu-2"
              className="border border-[#131313] bg-[#060606] mx-2 my-4 space-y-4 rounded-lg p-4"
            >
              <p className="font-semibold text-xl">Session Settings</p>
              <div id="session-settings" className="space-y-2">
                <div>
                  <Checkbox
                    id="start-recording"
                    defaultChecked
                    className="inline mr-2"
                    checked={sessionDetails.startRecording}
                    onCheckedChange={(value) =>
                      setSessionDetails({
                        ...sessionDetails,
                        startRecording: value === true,
                      })
                    }
                  />
                  <Label htmlFor="start-recording" className="font-semibold">
                    Auto Start Recording when session begins
                  </Label>
                </div>
                <div>
                  <Checkbox
                    id="recording-public"
                    className="inline mr-2"
                    checked={sessionDetails.recordingPublic}
                    onCheckedChange={(value) =>
                      setSessionDetails({
                        ...sessionDetails,
                        recordingPublic: value === true,
                      })
                    }
                  />
                  <Label htmlFor="recording-public" className="font-semibold">
                    Make Recording Public
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div
            id="right-menu"
            className="flex flex-col flex-1 mx-2 my-4 p-4 border border-[#131313] bg-[#060606] rounded-lg space-y-4"
          >
            <p className="font-semibold text-xl mb-6">Session Preview</p>
            <div id="session-name">
              <p className="uppercase font-semibold text-sm text-gray-500">
                Session Name
              </p>
              <p>
                {sessionDetails.sessionName
                  ? sessionDetails.sessionName
                  : "Untitled Session"}
              </p>
            </div>
            <div id="session-type">
              <p className="uppercase font-semibold text-sm text-gray-500">
                Session Type
              </p>
              <p>{sessionDetails.sessionType}</p>
            </div>
            <div id="no-of-participants">
              <p className="uppercase font-semibold text-sm text-gray-500">
                No. Of Participants
              </p>
              <p>{sessionDetails.noOfParticipants}</p>
            </div>
            <div id="created-on">
              <p className="uppercase font-semibold text-sm text-gray-500">
                Created On
              </p>
              <p>{new Date().toLocaleString()}</p>
            </div>
            <div id="status">
              <p className="uppercase font-semibold text-sm text-gray-500">
                Status
              </p>
              <p>Ready to record</p>
            </div>
            <Separator className="bg-[#131313]" />
            <div id="start-call" className="flex mt-6">
              <button
                className={cn(
                  "bg-[#3e70ee] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#2e50d0]",
                  sessionDetails.sessionName
                    ? ""
                    : "cursor-not-allowed opacity-50"
                )}
                disabled={sessionDetails.sessionName ? false : true}
              >
                Start Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSessions;
