import React from 'react';
import "./layout.css"
import Nav from "../nav/Nav.tsx";

interface LayoutProps {
    children?: React.ReactNode
}

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="app-layout">
            <Nav />
            <main className="children-container">
                {children}
            </main>
        </div>
    );
};

export default Layout;
