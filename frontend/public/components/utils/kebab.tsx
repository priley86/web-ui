/* eslint-disable no-undef */

import * as _ from 'lodash-es';
import * as React from 'react';

import { annotationsModal, configureReplicaCountModal, taintsModal, tolerationsModal, labelsModal, podSelectorModal, deleteModal } from '../modals';
import { resourceObjPath } from './index';
import { OneOf, Dropdown, KebabToggle, DropdownItem, DropdownPosition } from '@patternfly/react-core';
import { referenceForModel, K8sResourceKind, K8sResourceKindReference, K8sKind } from '../../module/k8s';
import { connectToModel } from '../../kinds';

const KebabItems: React.SFC<KebabItemsProps> = ({options, onClick}) => {
  const visibleOptions = _.reject(options, o => _.get(o, 'hidden', false));
  const lis = _.map(visibleOptions, (o, i) => <li key={i}><a href="#" onClick={e => onClick(e, o)}>{o.label}</a></li>);
  return <ul className="dropdown-menu dropdown-menu-right dropdown-menu--block co-kebab__dropdown">
    {lis}
  </ul>;
};

const kebabFactory: KebabFactory = {
  Delete: (kind, obj) => ({
    label: `Delete ${kind.label}`,
    callback: () => deleteModal({
      kind,
      resource: obj,
    }),
  }),
  Edit: (kind, obj) => ({
    label: `Edit ${kind.label}`,
    href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/yaml`,
  }),
  ModifyLabels: (kind, obj) => ({
    label: 'Edit Labels',
    callback: () => labelsModal({
      kind,
      resource: obj,
      blocking: true,
    }),
  }),
  ModifyPodSelector: (kind, obj) => ({
    label: 'Edit Pod Selector',
    callback: () => podSelectorModal({
      kind,
      resource:  obj,
      blocking: true,
    }),
  }),
  ModifyAnnotations: (kind, obj) => ({
    label: 'Edit Annotations',
    callback: () => annotationsModal({
      kind,
      resource: obj,
      blocking: true,
    }),
  }),
  ModifyCount: (kind, obj) => ({
    label: 'Edit Count',
    callback: () => configureReplicaCountModal({
      resourceKind: kind,
      resource: obj,
    }),
  }),
  ModifyTaints: (kind, obj) => ({
    label: 'Edit Taints',
    callback: () => taintsModal({
      resourceKind: kind,
      resource: obj,
      modalClassName: 'modal-lg',
    }),
  }),
  ModifyTolerations: (kind, obj) => ({
    label: 'Edit Tolerations',
    callback: () => tolerationsModal({
      resourceKind: kind,
      resource: obj,
      modalClassName: 'modal-lg',
    }),
  }),
  EditEnvironment: (kind, obj) => ({
    label: `${kind.kind === 'Pod' ? 'View' : 'Edit'} Environment`,
    href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/environment`,
  }),
  AddStorage: (kind, obj) => ({
    label: 'Add Storage',
    href: `${resourceObjPath(obj, kind.crd ? referenceForModel(kind) : kind.kind)}/attach-storage`,
  }),
};

// The common menu actions that most resource share
kebabFactory.common = [kebabFactory.ModifyLabels, kebabFactory.ModifyAnnotations, kebabFactory.Edit, kebabFactory.Delete];

export const ResourceKebab = connectToModel((props: ResourceKebabProps) => {
  const {actions, kindObj, resource, isDisabled} = props;

  if (!kindObj) {
    return null;
  }
  const options = _.reject(actions.map(a => a(kindObj, resource)), 'hidden');
  return <Kebab
    options={options}
    key={resource.metadata.uid}
    isDisabled={isDisabled !== undefined ? isDisabled : _.get(resource.metadata, 'deletionTimestamp')}
  />;
});

export class Kebab extends React.Component<KebabProps, KebabState> {
  static factory: KebabFactory = kebabFactory;
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  onToggle = isOpen => {
    this.setState({
      isOpen
    });
  };

  onSelect = event => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  render() {
    const { isOpen } = this.state;
    const { options, isDisabled, position, id } = this.props;

    const items = [];
    if(options && options.length){
      options.forEach((option) => {
        items.push(
          <DropdownItem key={option.label} 
            isDisabled={isDisabled} 
            onClick={option.callback} 
            href={option.href}
            component={ option.href ? "a" : "button"}>
            {option.label}
          </DropdownItem>
        );
      })
    }

    return (
      <Dropdown
        id={id}
        onSelect={this.onSelect}
        position={position || DropdownPosition.right}
        toggle={<KebabToggle onToggle={this.onToggle} />}
        isOpen={isOpen}
        isPlain
        dropdownItems={items}
      />
    );
  }
}

export type KebabProps = {
  id?: string;
  isDisabled?: boolean;
  options: KebabOption[];
  position?: OneOf<typeof DropdownPosition, keyof typeof DropdownPosition>;
}

export type KebabState = {
  isOpen: boolean;
}

export type KebabOption = {
  label: string;
  href?: string, callback?: () => any;
};
export type KebabAction = (kind, obj: K8sResourceKind) => KebabOption;

export type ResourceKebabProps = {
  kindObj: K8sKind;
  actions: KebabAction[];
  kind: K8sResourceKindReference;
  resource: K8sResourceKind;
  isDisabled?: boolean;
};

export type KebabItemsProps = {
  options: KebabOption[];
  onClick: (event: React.MouseEvent<{}>, option: KebabOption) => void;
};

export type KebabFactory = {[name: string]: KebabAction} & {common?: KebabAction[]};

KebabItems.displayName = 'KebabItems';
ResourceKebab.displayName = 'ResourceKebab';
