import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { ColHead, DetailsPage, List, ListHeader, ListPage, Table, Vr, Vd } from './factory';
import { Kebab, LabelList, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Timestamp, StatusIconAndText } from './utils';

const { common } = Kebab.factory;
const menuActions = [...common];

const PVStatus = ({pv}) => <StatusIconAndText status={pv.status.phase} />;

const tableColumnClasses = [
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  Kebab.columnClass,
];

const Header = props => <ListHeader>
  <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 hidden-xs" sortField="status.phase">Status</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.claimRef.name">Claim</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="spec.capacity.storage">Capacity</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 col-sm-4 col-xs-6" sortField="metadata.labels">Labels</ColHead>
  <ColHead {...props} className="col-lg-2 col-md-2 hidden-sm hidden-xs" sortField="metadata.creationTimestamp">Created</ColHead>
</ListHeader>;

const TableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'Labels', sortField: 'metadata.labels', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Created', sortField: 'metadata.creationTimestamp', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: '',
      props: { className: tableColumnClasses[3]},
    },
  ];
};
TableHeader.displayName = 'TableHeader';

const kind = 'PersistentVolume';

const Row = ({obj}) => <div className="row co-resource-list__item">
  <div className="col-lg-2 col-md-2 col-sm-4 col-xs-6">
    <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
  </div>
  <div className="col-lg-2 col-md-2 col-sm-4 hidden-xs">
    <PVStatus pv={obj} />
  </div>
  <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
    {_.get(obj,'spec.claimRef.name') ?
      <ResourceLink kind="PersistentVolumeClaim" name={obj.spec.claimRef.name} namespace={obj.spec.claimRef.namespace} title={obj.spec.claimRef.name} />
      :
      <div className="text-muted">No Claim</div>
    }
  </div>
  <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
    {_.get(obj, 'spec.capacity.storage', '-')}
  </div>
  <div className="col-lg-2 col-md-2 col-sm-4 col-xs-6">
    <LabelList kind={kind} labels={obj.metadata.labels} />
  </div>
  <div className="col-lg-2 col-md-2 hidden-sm hidden-xs">
    <Timestamp timestamp={obj.metadata.creationTimestamp} />
  </div>
  <div className="dropdown-kebab-pf">
    <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
  </div>
</div>;

export const TableRow = ({obj, index, key, style}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </Vd>
      <Vd className={tableColumnClasses[1]}>
        <PVStatus pv={obj} />
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={kind} resource={obj} />
      </Vd>
    </Vr>
  );
};
TableRow.displayName = 'TableRow';

const Details = ({obj}) => <React.Fragment>
  <div className="co-m-pane__body">
    <SectionHeading text="PersistentVolume Overview" />
    <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} showPodSelector />
  </div>
</React.Fragment>;

export const PersistentVolumesList = props => <React.Fragment>
  <Table {...props} aria-label="Persistent Volumes" Header={TableHeader} Row={TableRow} virtualize />
  {false && <List {...props} Header={Header} Row={Row} /> }
</React.Fragment>;
export const PersistentVolumesPage = props => <ListPage {...props} ListComponent={PersistentVolumesList} kind={kind} canCreate={true} />;
export const PersistentVolumesDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml()]}
/>;
