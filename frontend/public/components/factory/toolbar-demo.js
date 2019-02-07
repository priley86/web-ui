import React from 'react';
import {
  Button,
  Dropdown,
  DropdownPosition,
  DropdownToggle,
  DropdownItem,
  KebabToggle,
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
// import flexStyles from '@patternfly/patternfly/utilities/Flex/flex.css';
// import spacingStyles from '@patternfly/patternfly/utilities/Spacing/spacing.css';
import { CaretDownIcon, ListUlIcon, SortAlphaDownIcon, TableIcon } from '@patternfly/react-icons';

class SimpleToolbarDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDropDownOpen: false,
      isSelectOpen: false,
      isKebabOpen: false,
      searchValue: ''
    };
  }

  handleTextInputChange = value => {
    this.setState({ searchValue: value });
  };

  onDropDownToggle = isOpen => {
    this.setState({
      isDropDownOpen: isOpen
    });
  };

  onDropDownSelect = event => {
    this.setState({
      isDropDownOpen: !this.state.isDropDownOpen
    });
  };

  onKebabToggle = isOpen => {
    this.setState({
      isKebabOpen: isOpen
    });
  };

  onKebabSelect = event => {
    this.setState({
      isKebabOpen: !this.state.isKebabOpen
    });
  };
  buildSearchBox = () => {
    const { value } = this.state.searchValue;
    return (
      <TextInput value={value} type="search" onChange={this.handleTextInputChange} aria-label="search text input" placeholder="Filter projects by name" />
    );
  };
  buildDropdown = () => {
    const { isDropDownOpen } = this.state;
    return (
      <Dropdown
        onToggle={this.onDropDownToggle}
        onSelect={this.onDropDownSelect}
        position={DropdownPosition.right}
        toggle={<DropdownToggle onToggle={this.onDropDownToggle}>All</DropdownToggle>}
        isOpen={isDropDownOpen}
        dropdownItems={[
          <DropdownItem key="item-1">Item 1</DropdownItem>,
          <DropdownItem key="item2">Item 2</DropdownItem>,
          <DropdownItem key="item-3">Item 3</DropdownItem>,
          <DropdownItem isDisabled key="all">All</DropdownItem>
        ]}
      >
      </Dropdown>
    );
  };
  buildKebab = () => {
    const { isKebabOpen } = this.state;

    return (
      <Dropdown
        onToggle={this.onKebabToggle}
        onSelect={this.onKebabSelect}
        position={DropdownPosition.right}
        toggle={<KebabToggle onToggle={this.onKebabToggle} />}
        isOpen={isKebabOpen}
        isPlain
        dropdownItems={[
          <DropdownItem key="link">Link</DropdownItem>,
          <DropdownItem component="button" key="action-button">Action</DropdownItem>,
          <DropdownItem isDisabled key="disabled-link">Disabled Link</DropdownItem>,
          <DropdownItem isDisabled component="button" key="disabled-button">
            Disabled Action
          </DropdownItem>
        ]}
      >
      </Dropdown>
    );
  };
  render() {
    const { isSelectOpen } = this.state;

    return (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <Dropdown
              onToggle={(isOpen) => {
                this.setState({isSelectOpen: isOpen});
              }
              }
              onSelect={() => {
                this.setState(prevState => ({isSelectOpen: !prevState.isSelectOpen}));
              }
              }
              className="pf-c-toolbar__bulk-select"
              position={DropdownPosition.left}
              toggle={
                <DropdownToggle className="pf-m-split-button" iconComponent={null} onToggle={(isOpen) => {
                  this.setState({isSelectOpen: isOpen});
                }}>
                <label className="pf-c-dropdown__toggle-check" labelFor="toolbar-simple-split-button-dropdown-simple-example-check">
                  <input type="checkbox" id="toolbar-simple-split-button-dropdown-simple-example-check" aria-label="Select all" />
                </label>
                <CaretDownIcon />
                </DropdownToggle>}
              isOpen={isSelectOpen}
              dropdownItems={[
                <DropdownItem key="item-1">Select all</DropdownItem>,
                <DropdownItem key="item2">Select none</DropdownItem>,
                <DropdownItem key="item-3">Other action</DropdownItem>,
              ]}
            />
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>{this.buildSearchBox()}</ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>{this.buildDropdown()}</ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <Button variant="plain" aria-label="Sort A-Z">
              <SortAlphaDownIcon />
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
        <ToolbarGroup>
          <ToolbarItem>
            <Button variant="plain" aria-label="Insert Table">
              <TableIcon />
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="plain" aria-label="Insert Bulleted List">
              <ListUlIcon />
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="plain" aria-label="Action 1">
              Action
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button aria-label="Action 2">Create Project</Button>
          </ToolbarItem>
          <ToolbarItem>{this.buildKebab()}</ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

export default SimpleToolbarDemo;