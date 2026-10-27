import { Button } from "./Button";
import { DropdownMenu } from "./DropdownMenu";
import { Icon } from "./Icon";
import "./PageHeader.css";

const ACTIONS = ["Export", "Create link", "Add channel"];

/**
 * Page title, welcome line and page buttons. Below 720 px the three buttons collapse into one
 * "Actions" button, as in the 360 px frame. The actions aren't wired to anything in this case.
 */
export function PageHeader({ title, firstName }: { title: string; firstName: string }) {
  return (
    <header className="page-header">
      <div className="page-header__row">
        <h1 className="page-header__title">{title}</h1>
        <div className="page-header__buttons">
          {ACTIONS.map((action) => (
            <Button key={action}>{action}</Button>
          ))}
        </div>
        <div className="page-header__actions">
          <DropdownMenu
            align="end"
            items={ACTIONS.map((action) => ({ type: "action", key: action, label: action, onSelect: () => {} }))}
            trigger={(props) => (
              <Button {...props}>
                Actions
                <Icon name="chevron-down" />
              </Button>
            )}
          />
        </div>
      </div>
      <p className="page-header__welcome">Welcome back {firstName}! Here's how your brands are doing.</p>
    </header>
  );
}
