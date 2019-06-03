import * as React from 'react';
import * as _ from 'lodash-es';
import { sortable } from '@patternfly/react-table';
import * as classNames from 'classnames';
import { DetailsPage, ListPage, Table, Vr, Vd } from './factory';
import { Kebab, LabelList, navFactory, ResourceKebab, SectionHeading, ResourceLink, ResourceSummary, Timestamp, StatusIconAndText } from './utils';

const { common } = Kebab.factory;
const menuActions = [...common];

const PVStatus = ({pv}) => <StatusIconAndText status={pv.status.phase} />;

const tableColumnClasses = [
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-4-col-on-md', 'pf-m-6-col-on-sm'),
  classNames('pf-m-2-col-on-xl', 'pf-m-2-col-on-lg', 'pf-m-hidden', 'pf-m-visible-on-lg'),
  Kebab.columnClass,
];

const TableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'Status', sortField: 'status.phase', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Claim', sortField: 'spec.claimRef.name', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    {
      title: 'Capacity', sortField: 'spec.capacity.storage', transforms: [sortable],
      props: { className: tableColumnClasses[3]},
    },
    {
      title: 'Labels', sortField: 'metadata.labels', transforms: [sortable],
      props: { className: tableColumnClasses[4]},
    },
    {
      title: 'Created', sortField: 'metadata.creationTimestamp', transforms: [sortable],
      props: { className: tableColumnClasses[5]},
    },
    {
      title: '', props: { className: tableColumnClasses[6]},
    },
  ];
};
TableHeader.displayName = 'TableHeader';

const kind = 'PersistentVolume';

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
        {_.get(obj,'spec.claimRef.name') ?
          <ResourceLink kind="PersistentVolumeClaim" name={obj.spec.claimRef.name} namespace={obj.spec.claimRef.namespace} title={obj.spec.claimRef.name} />
          :
          <div className="text-muted">No Claim</div>
        }
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        {_.get(obj, 'spec.capacity.storage', '-')}
      </Vd>
      <Vd className={tableColumnClasses[4]}>
        <LabelList kind={kind} labels={obj.metadata.labels} />
      </Vd>
      <Vd className={tableColumnClasses[5]}>
        <Timestamp timestamp={obj.metadata.creationTimestamp} />
      </Vd>
      <Vd className={tableColumnClasses[6]}>
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

export const PersistentVolumesList = props => <Table {...props} aria-label="Persistent Volumes" Header={TableHeader} Row={TableRow} virtualize />;
export const PersistentVolumesPage = props => <ListPage {...props} ListComponent={PersistentVolumesList} kind={kind} canCreate={true} />;
export const PersistentVolumesDetailsPage = props => <DetailsPage
  {...props}
  menuActions={menuActions}
  pages={[navFactory.details(Details), navFactory.editYaml()]}
/>;
