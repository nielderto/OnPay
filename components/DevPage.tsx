import { SocialIcon } from "react-social-icons";

interface ProfileCardProps {
    name: string;
    role: string;
    imageUrl: string;
    showActions?: boolean;
    socialMedia?: string[];
}

export default function DevPage({ name, role, imageUrl, showActions = true, socialMedia = [] }: ProfileCardProps) {
    return (
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm pt-16">
        <div className="flex flex-col items-center pb-10">
            <img className="w-32 h-32 mb-3 rounded-full shadow-lg" src={imageUrl} alt={`${name} profile`}/>
            <h5 className="mb-1 text-xl font-medium text-black">{name}</h5>
            <span className="text-sm text-gray-500">{role}</span>
            {showActions && (
                <div className="flex mt-4 md:mt-6 border-t-1">
                    {socialMedia.map((url, index) => (
                        <SocialIcon key={index} url={url} bgColor="transparent" fgColor="black" />
                    ))}
                </div>
            )}
        </div>
    </div>
    );
}