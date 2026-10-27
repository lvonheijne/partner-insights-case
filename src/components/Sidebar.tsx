import logo from "../assets/logo.svg";
import "./Sidebar.css";

const NAV = ["Home", "Earnings", "Insights", "Brands", "Products", "Features"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Figma "primary-menu" with "menu-items". Full width from 1024 px. Below that it collapses to the blank
 * strip from the 720 and 360 px frames; a menu button and overlay for it are out of scope (see README).
 */
export function Sidebar({ partnerName, company, current }: { partnerName: string; company: string; current: string }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__content">
        <div className="sidebar__top">
          <img src={logo} alt="Adtraction" width={140} height={17} className="sidebar__logo" />
          <nav aria-label="Main">
            <ul className="sidebar__nav">
              {NAV.map((item) => (
                <li key={item}>
                  <a href="#" className="menu-item" aria-current={item === current ? "page" : undefined}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="sidebar__bottom">
          <a href="#" className="sidebar__settings">
            Settings
          </a>
          <div className="sidebar__user">
            <span className="sidebar__avatar" aria-hidden="true">
              {initials(partnerName)}
            </span>
            <span className="sidebar__user-text">
              <span className="sidebar__user-name">{partnerName}</span>
              <span className="sidebar__user-company">{company}</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
