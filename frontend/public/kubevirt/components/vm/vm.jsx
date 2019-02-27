import React, { Component } from 'react';
import * as _ from 'lodash-es';
import { connect } from 'react-redux';
import {
  VmStatus,
  getVmStatus,
  VM_STATUS_ALL,
  VM_STATUS_TO_TEXT,
  CDI_KUBEVIRT_IO,
  getResource,
} from 'kubevirt-web-ui-components';

import { ListHeader, ColHead, List, ListPage, ResourceRow, Table } from '../factory/okdfactory';
import { sortable, headerCol } from '@patternfly/react-table';
import { ResourceLink, ResourceKebab } from '../utils/okdutils';
import { actions } from '../../module/okdk8s';
import {
  VirtualMachineInstanceModel,
  VirtualMachineModel,
  PodModel,
  NamespaceModel,
  VirtualMachineInstanceMigrationModel,
} from '../../models/index';
import {
  getLabelMatcher,
  findImporterPods, findVMIMigration, findPod,
} from '../utils/resources';
import { DASHES, VIRT_LAUNCHER_POD_PREFIX } from '../utils/constants';
import { openCreateVmWizard } from '../modals/create-vm-modal';
import { menuActions } from './menu-actions';
import { WithResources } from '../utils/withResources';

const mainRowSize = 'col-lg-4 col-md-4 col-sm-6 col-xs-6';
const otherRowSize = 'col-lg-4 col-md-4 hidden-sm hidden-xs';

const VMHeader = props => <ListHeader>
  <ColHead {...props} className={mainRowSize} sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className={otherRowSize} sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className={mainRowSize} sortField="spec.running">State</ColHead>
</ListHeader>;

const VMTableHeader = props => {
  return [
    { title: 'Name', sortField: 'metadata.name', transforms: [sortable], cellTransforms: [headerCol()], props},
    { title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable], props },
    { title: 'State', sortField: 'metadata.namespace', transforms: [sortable], props },
    { title: '' },
  ];
};

const VMTableRow = (vm) => {
  const { name, namespace } = vm.metadata;
  const migrationResources = getResource(VirtualMachineInstanceMigrationModel, {namespace});
  const resourceMap = {
    pods: {
      resource: getResource(PodModel, {namespace, matchLabels: getLabelMatcher(vm)}),
    },
    importerPods: {
      resource: getResource(PodModel, {namespace, matchLabels: {[CDI_KUBEVIRT_IO]: 'importer'}}),
    },
    migrations: {
      resource: migrationResources,
    },
  };

  return [
    {
      title: <ResourceLink kind={VirtualMachineModel.kind} name={name} namespace={namespace} title={vm.metadata.uid} />,
    },
    {
      title: <ResourceLink kind={NamespaceModel.kind} name={namespace} title={namespace} />,
    },
    {
      title: <WithResources resourceMap={resourceMap}
        resourceToProps={({ pods, importerPods, migrations }) => ({
          launcherPod: findPod(pods, name, VIRT_LAUNCHER_POD_PREFIX),
          importerPods: findImporterPods(importerPods, vm),
          migration: findVMIMigration(migrations, name),
        })}
        loaderComponent={() => DASHES}>
        <VmStatus vm={vm} />
      </WithResources>,
    }, {
      title: <div className="dropdown-kebab-pf">
        <ResourceKebab actions={menuActions}
          kind={VirtualMachineModel.kind}
          resource={vm}
          resources={[
            getResource(VirtualMachineInstanceModel, {name, namespace, isList: false}),
            migrationResources,
          ]} />
      </div>,
    },
  ];
};

const VMTableRows = componentProps => {
  //this logic will go away once RowWrapper is overridable in PF-R
  // https://github.com/patternfly/patternfly-react/issues/1310
  return _.map(componentProps.data, obj => obj && obj.metadata && VMTableRow(obj));
};

const onSelect = (event, isSelected, rowId) => {
  console.log(rowId);
}

const VMRow = ({obj: vm}) => {

  const { name, namespace } = vm.metadata;
  const migrationResources = getResource(VirtualMachineInstanceMigrationModel, {namespace});
  const resourceMap = {
    pods: {
      resource: getResource(PodModel, {namespace, matchLabels: getLabelMatcher(vm)}),
    },
    importerPods: {
      resource: getResource(PodModel, {namespace, matchLabels: {[CDI_KUBEVIRT_IO]: 'importer'}}),
    },
    migrations: {
      resource: migrationResources,
    },
  };

  return <ResourceRow obj={vm}>
    <div className={mainRowSize}>
      <ResourceLink kind={VirtualMachineModel.kind} name={name} namespace={namespace} title={vm.metadata.uid} />
    </div>
    <div className={otherRowSize}>
      <ResourceLink kind={NamespaceModel.kind} name={namespace} title={namespace} />
    </div>
    <div className={mainRowSize}>
      <WithResources resourceMap={resourceMap}
        resourceToProps={({ pods, importerPods, migrations }) => ({
          launcherPod: findPod(pods, name, VIRT_LAUNCHER_POD_PREFIX),
          importerPods: findImporterPods(importerPods, vm),
          migration: findVMIMigration(migrations, name),
        })}
        loaderComponent={() => DASHES}>
        <VmStatus vm={vm} />
      </WithResources>
    </div>
    <div className="dropdown-kebab-pf">
      <ResourceKebab actions={menuActions}
        kind={VirtualMachineModel.kind}
        resource={vm}
        resources={[
          getResource(VirtualMachineInstanceModel, {name, namespace, isList: false}),
          migrationResources,
        ]} />
    </div>
  </ResourceRow>;
};

const VMList = (props) => <React.Fragment>
  <Table {...props} Header={VMTableHeader} Rows={VMTableRows} onSelect={onSelect} />
  <br />
  <br />
  <List {...props} Header={VMHeader} Row={VMRow} />
</React.Fragment>;

const mapStateToProps = ({k8s}) => ({
  k8s,
});

const mapDispatchToProps = () => ({
  stopK8sWatch: actions.stopK8sWatch,
  watchK8sList: actions.watchK8sList,
});

const filters = [{
  type: 'vm-status',
  selected: VM_STATUS_ALL,
  reducer: getVmStatus,
  items: VM_STATUS_ALL.map(status => ({ id: status, title: VM_STATUS_TO_TEXT[status] }) ),
}];

export const VirtualMachinesPage = connect(
  mapStateToProps, mapDispatchToProps)(class VirtualMachinesPage extends Component {

  constructor(props){
    super(props);

    const createItems = {
      wizard: 'Create with Wizard',
      yaml: 'Create from YAML',
    };

    this.createProps = {
      items: createItems,
      createLink: (type) => {
        switch (type) {
          case 'wizard':
            return () => openCreateVmWizard(this.props.namespace);
          default:
            return `/k8s/ns/${this.props.namespace || 'default'}/virtualmachines/new/`;
        }
      },
    };
  }

  render() {
    return <React.Fragment>
      <ListPage
        {...this.props}
        canCreate={true}
        kind={VirtualMachineModel.kind}
        ListComponent={VMList}
        createProps={this.createProps}
        rowFilters={filters}
      />
    </React.Fragment>;
  }
});
