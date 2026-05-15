import "./nav.css"

interface NavProps {
    className?: string
}


const Nav = ({className} : NavProps) => {
    return (
        <div className={`${className} nav`}>
            <h1>Vision Testing</h1>
        </div>
    );
};

export default Nav;