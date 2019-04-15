import * as React from 'react';
import { Link } from 'react-router-dom';
import { shallow, ShallowWrapper } from 'enzyme';
import * as _ from 'lodash-es';

import { PackageManifestTableHeader, PackageManifestTableRow, PackageManifestTableRowProps, PackageManifestList, PackageManifestListProps } from '../../../public/components/operator-lifecycle-manager/package-manifest';
import { ClusterServiceVersionLogo, PackageManifestKind } from '../../../public/components/operator-lifecycle-manager';
import { TableInnerProps, Vr } from '../../../public/components/factory';
import { testPackageManifest, testCatalogSource, testSubscription } from '../../../__mocks__/k8sResourcesMocks';

describe(PackageManifestTableHeader.displayName, () => {
  it('returns column header definition for manifest', () => {
    expect(Array.isArray(PackageManifestTableHeader()));
  });
});

describe(PackageManifestTableRow.displayName, () => {
  let wrapper: ShallowWrapper<PackageManifestTableRowProps>;

  beforeEach(() => {
    wrapper = shallow(<PackageManifestTableRow obj={testPackageManifest} catalogSourceNamespace={testCatalogSource.metadata.namespace} catalogSourceName={testCatalogSource.metadata.name} subscription={testSubscription} defaultNS="default" canSubscribe={true} index={0} style={{}} trKey="key" />);
  });

  it('renders column for package name and logo', () => {
    expect(wrapper.find(Vr).childAt(0).shallow().find(ClusterServiceVersionLogo).props().displayName).toEqual(testPackageManifest.status.channels[0].currentCSVDesc.displayName);
  });

  it('renders column for latest CSV version for package in catalog', () => {
    const {name, currentCSVDesc: {version}} = testPackageManifest.status.channels[0];
    expect(wrapper.find(Vr).childAt(1).shallow().text()).toEqual(`${version} (${name})`);
  });

  it('does not render link if no subscriptions exist in the current namespace', () => {
    wrapper = wrapper.setProps({subscription: null});

    expect(wrapper.find(Vr).childAt(2).shallow().text()).toContain('None');
  });

  it('renders column with link to subscriptions', () => {
    expect(wrapper.find(Vr).childAt(2).shallow().find(Link).at(0).props().to).toEqual(`/operatormanagement/ns/default?name=${testSubscription.metadata.name}`);
    expect(wrapper.find(Vr).childAt(2).shallow().find(Link).at(0).childAt(0).text()).toEqual('View');
  });

  it('renders button to create new subscription if `canSubscribe` is true', () => {
    expect(wrapper.find(Vr).childAt(2).shallow().find('button').text()).toEqual('Create Subscription');
  });

  it('does not render button to create new subscription if `canSubscribe` is false', () => {
    wrapper = wrapper.setProps({canSubscribe: false});

    expect(wrapper.find(Vr).childAt(2).shallow().find('button').exists()).toBe(false);
  });
});

describe(PackageManifestList.displayName, () => {
  let wrapper: ShallowWrapper<PackageManifestListProps>;
  let packages: PackageManifestKind[];

  beforeEach(() => {
    const otherPackageManifest = _.cloneDeep(testPackageManifest);
    otherPackageManifest.status.catalogSource = 'another-catalog-source';
    otherPackageManifest.status.catalogSourceDisplayName = 'Another Catalog Source';
    otherPackageManifest.status.catalogSourcePublisher = 'Some Publisher';
    packages = [otherPackageManifest, testPackageManifest];

    wrapper = shallow(<PackageManifestList.WrappedComponent loaded={true} data={packages} operatorGroup={null} subscription={null} />);
  });

  it('renders a section for each unique `CatalogSource` for the given packages', () => {
    expect(wrapper.find('.co-catalogsource-list__section').length).toEqual(2);
    packages.forEach(({status}, i) => {
      expect(wrapper.find('.co-catalogsource-list__section').at(i).find('h3').text()).toEqual(status.catalogSourceDisplayName);
    });
  });

  it('renders `Table` component with correct props for each section', () => {
    expect(wrapper.find('Connect(TableInner)').length).toEqual(2);
    packages.forEach((pkg, i) => {
      const tableProps = (wrapper.find('.co-catalogsource-list__section').at(i).find('Connect(TableInner)').props() as unknown) as TableInnerProps;
      expect(tableProps.Header).toEqual(PackageManifestTableHeader);
      expect(tableProps.data.length).toEqual(1);
      expect(tableProps['aria-label']).toEqual('Package Manifests');
    });
  });
});
