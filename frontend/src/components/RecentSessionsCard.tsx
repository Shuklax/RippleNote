import { Download, Play, Trash2 } from "lucide-react";

type recentSessionsCardProps = {
  title: string;
  date: string;
  duration: string;
  participants: string;
};

const RecentSessionsCard = ({
  title,
  date,
  duration,
  participants,
}: recentSessionsCardProps) => {
  return (
    <>
      <div className="group flex justify-between px-4 py-4 rounded-xl border border-[#131313] bg-[#060606]">
        <div className="flex space-x-3">
          <div id="mic-symbol" className="py-2 px-3 bg-[#222222] rounded-lg">
            🎙️
          </div>
          <div id="title-date-duration">
            <p className="font-bold">{title}</p>
            <p className="text-sm text-[#969696]">
              {date} • {duration}
            </p>
          </div>
        </div>
        <div className="space-x-4 inline-flex mr-4 items-center">
          <p className="text-sm text-[#8b8b8b]">{participants} participants</p>
          <span className="hidden group-hover:inline-flex p-2 rounded-lg hover:bg-[#222222]">
            <Play size={15} />
          </span>
          <span className="hidden group-hover:inline-flex p-2 rounded-lg hover:bg-[#222222]">
            <Download size={15} />
          </span>
          <span className="hidden group-hover:inline-flex p-2 rounded-lg hover:bg-[#222222]">
            <Trash2 size={15} className="text-red-500" />
          </span>
        </div>
      </div>
    </>
  );
};

export default RecentSessionsCard;
