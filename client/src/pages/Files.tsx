import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";

type FilesProps = {
    children?: ReactNode;
};

const Files = ({ children }: FilesProps) => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">{children}</main>
        </div>
    );
};

export default Files;
