import React from 'react'
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
        <div className="logo">
            <Link to="/">
                <h2 className="title">Dapps Portfolio</h2>
            </Link>
        </div>

        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/blog">Blog</Link>
                </li>
                <li>
                    <a href="https://twitter.com/10_to_Sen">SNS</a>
                </li>
            </ul>
        </nav>
    </header>
  )
}

export default Header