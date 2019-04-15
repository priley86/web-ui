import * as _ from 'lodash-es';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import { ColHead, DetailsPage, List, ListHeader, ListPage, Table, Vr, Vd } from './factory';
import { fromNow } from './utils/datetime';
import { referenceFor, kindForReference } from '../module/k8s';
import {
  Kebab,
  kindObj,
  navFactory,
  ResourceKebab,
  ResourceLink,
  ResourceSummary,
  SectionHeading,
} from './utils';

const { common } = Kebab.factory;
const menuActions = [...common];

const tableColumnClasses = [
  classNames('pf-m-6-col-on-sm', 'pf-m-4-col-on-md'),
  classNames('pf-m-6-col-on-sm', 'pf-m-4-col-on-md'),
  classNames('pf-m-4-col-on-md', 'pf-m-hidden', 'pf-m-visible-on-md'),
  Kebab.columnClass,
];

const Header = props => <ListHeader>
  <ColHead {...props} className="col-xs-6 col-sm-4" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-xs-6 col-sm-4" sortField="metadata.namespace">Namespace</ColHead>
  <ColHead {...props} className="col-sm-4 hidden-xs" sortField="metadata.creationTimestamp">Created</ColHead>
</ListHeader>;

export const TableHeader = () => {
  return [
    {
      title: 'Name', sortField: 'metadata.name', transforms: [sortable],
      props: { className: tableColumnClasses[0]},
    },
    {
      title: 'Namespace', sortField: 'metadata.namespace', transforms: [sortable],
      props: { className: tableColumnClasses[1]},
    },
    {
      title: 'Created', sortField: 'metadata.creationTimestamp', transforms: [sortable],
      props: { className: tableColumnClasses[2]},
    },
    { title: '',
      props: { className: tableColumnClasses[3]},
    },
  ];
};
TableHeader.displayName = 'TableHeader';

const RowForKind = kind => function RowForKind_({obj}) {
  return <div className="row co-resource-list__item">
    <div className="col-xs-6 col-sm-4">
      <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
    </div>
    <div className="col-xs-6 col-sm-4 co-break-word">
      { obj.metadata.namespace
        ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
        : 'None'
      }
    </div>
    <div className="col-xs-6 col-sm-4 hidden-xs">
      { fromNow(obj.metadata.creationTimestamp) }
    </div>
    <div className="dropdown-kebab-pf">
      <ResourceKebab actions={menuActions} kind={referenceFor(obj) || kind} resource={obj} />
    </div>
  </div>;
};

const TableRowForKind = ({obj, index, key, style, customData}) => {
  return (
    <Vr id={obj.metadata.uid} index={index} trKey={key} style={style}>
      <Vd className={tableColumnClasses[0]}>
        <ResourceLink kind={customData.kind} name={obj.metadata.name} namespace={obj.metadata.namespace} title={obj.metadata.name} />
      </Vd>
      <Vd className={classNames(tableColumnClasses[1], 'co-break-word')}>
        { obj.metadata.namespace
          ? <ResourceLink kind="Namespace" name={obj.metadata.namespace} title={obj.metadata.namespace} />
          : 'None'
        }
      </Vd>
      <Vd className={tableColumnClasses[2]}>
        { fromNow(obj.metadata.creationTimestamp) }
      </Vd>
      <Vd className={tableColumnClasses[3]}>
        <ResourceKebab actions={menuActions} kind={referenceFor(obj) || customData.kind} resource={obj} />
      </Vd>
    </Vr>
  );
};
TableRowForKind.displayName = 'TableRowForKind';

const DetailsForKind = kind => function DetailsForKind_({obj}) {
  return <React.Fragment>
    <div className="co-m-pane__body">
      <SectionHeading text={`${kindForReference(kind)} Overview`} />
      <ResourceSummary resource={obj} podSelector="spec.podSelector" showNodeSelector={false} />
    </div>
  </React.Fragment>;
};

export const DefaultList = props => {
  const { kinds } = props;
  const Row = RowForKind(kinds[0]);
  Row.displayName = 'RowForKind';

  return <React.Fragment>
    <Table {...props}
      aria-label="Default Resource"
      kinds={[kinds[0]]}
      customData={{kind: kinds[0]}}
      Header={TableHeader}
      Row={TableRowForKind}
      virtualize />
    {false && <List {...props} Header={Header} Row={Row} /> }
  </React.Fragment>;
};
DefaultList.displayName = DefaultList;

export const DefaultPage = props =>
  <ListPage {...props} ListComponent={DefaultList} canCreate={props.canCreate || _.get(kindObj(props.kind), 'crd')} />;
DefaultPage.displayName = 'DefaultPage';


export const DefaultDetailsPage = props => {
  const pages = [navFactory.details(DetailsForKind(props.kind)), navFactory.editYaml()];
  return <DetailsPage {...props} menuActions={menuActions} pages={pages} />;
};
DefaultDetailsPage.displayName = 'DefaultDetailsPage';
