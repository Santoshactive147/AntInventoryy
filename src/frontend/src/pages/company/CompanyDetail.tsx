import { t } from '@lingui/macro';
import { Grid, Skeleton, Stack } from '@mantine/core';
import {
  IconBuildingFactory2,
  IconBuildingWarehouse,
  IconDots,
  IconInfoCircle,
  IconMap2,
  IconNotes,
  IconPackageExport,
  IconPackages,
  IconPaperclip,
  IconShoppingCart,
  IconTruckDelivery,
  IconTruckReturn,
  IconUsersGroup
} from '@tabler/icons-react';
import { ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import AdminButton from '../../components/buttons/AdminButton';
import { DetailsField, DetailsTable } from '../../components/details/Details';
import DetailsBadge from '../../components/details/DetailsBadge';
import { DetailsImage } from '../../components/details/DetailsImage';
import { ItemDetailsGrid } from '../../components/details/ItemDetails';
import NotesEditor from '../../components/editors/NotesEditor';
import {
  ActionDropdown,
  DeleteItemAction,
  EditItemAction
} from '../../components/items/ActionDropdown';
import { Breadcrumb } from '../../components/nav/BreadcrumbList';
import InstanceDetail from '../../components/nav/InstanceDetail';
import { PageDetail } from '../../components/nav/PageDetail';
import { PanelGroup, PanelType } from '../../components/nav/PanelGroup';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { UserRoles } from '../../enums/Roles';
import { companyFields } from '../../forms/CompanyForms';
import { useEditApiFormModal } from '../../hooks/UseForm';
import { useInstance } from '../../hooks/UseInstance';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import { AddressTable } from '../../tables/company/AddressTable';
import { ContactTable } from '../../tables/company/ContactTable';
import { AttachmentTable } from '../../tables/general/AttachmentTable';
import { ManufacturerPartTable } from '../../tables/purchasing/ManufacturerPartTable';
import { PurchaseOrderTable } from '../../tables/purchasing/PurchaseOrderTable';
import { SupplierPartTable } from '../../tables/purchasing/SupplierPartTable';
import { ReturnOrderTable } from '../../tables/sales/ReturnOrderTable';
import { SalesOrderTable } from '../../tables/sales/SalesOrderTable';
import { StockItemTable } from '../../tables/stock/StockItemTable';

export type CompanyDetailProps = {
  title: string;
  breadcrumbs: Breadcrumb[];
};

/**
 * Detail view for a single company instance
 */
export default function CompanyDetail(props: Readonly<CompanyDetailProps>) {
  const { id } = useParams();

  const user = useUserState();

  const {
    instance: company,
    refreshInstance,
    instanceQuery,
    requestStatus
  } = useInstance({
    endpoint: ApiEndpoints.company_list,
    pk: id,
    params: {},
    refetchOnMount: true
  });

  const detailsPanel = useMemo(() => {
    if (instanceQuery.isFetching) {
      return <Skeleton />;
    }

    let tl: DetailsField[] = [
      {
        type: 'text',
        name: 'description',
        label: t`Description`,
        copy: true
      },
      {
        type: 'link',
        name: 'website',
        label: t`Website`,
        external: true,
        copy: true,
        hidden: !company.website
      },
      {
        type: 'text',
        name: 'phone',
        label: t`Phone Number`,
        copy: true,
        hidden: !company.phone
      },
      {
        type: 'text',
        name: 'email',
        label: t`Email Address`,
        copy: true,
        hidden: !company.email
      }
    ];

    let tr: DetailsField[] = [
      {
        type: 'string',
        name: 'currency',
        label: t`Default Currency`
      },
      {
        type: 'boolean',
        name: 'is_supplier',
        label: t`Supplier`,
        icon: 'suppliers'
      },
      {
        type: 'boolean',
        name: 'is_manufacturer',
        label: t`Manufacturer`,
        icon: 'manufacturers'
      },
      {
        type: 'boolean',
        name: 'is_customer',
        label: t`Customer`,
        icon: 'customers'
      }
    ];

    return (
      <ItemDetailsGrid>
        <Grid>
          <Grid.Col span={4}>
            <DetailsImage
              appRole={UserRoles.purchase_order}
              apiPath={apiUrl(ApiEndpoints.company_list, company.pk)}
              src={company.image}
              pk={company.pk}
              refresh={refreshInstance}
              imageActions={{
                uploadFile: true,
                deleteFile: true
              }}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <DetailsTable item={company} fields={tl} />
          </Grid.Col>
        </Grid>
        <DetailsTable item={company} fields={tr} />
      </ItemDetailsGrid>
    );
  }, [company, instanceQuery]);

  const companyPanels: PanelType[] = useMemo(() => {
    return [
      {
        name: 'details',
        label: t`Details`,
        icon: <IconInfoCircle />,
        content: detailsPanel
      },
      {
        name: 'manufactured-parts',
        label: t`Manufactured Parts`,
        icon: <IconBuildingFactory2 />,
        hidden: !company?.is_manufacturer,
        content: company?.pk && (
          <ManufacturerPartTable params={{ manufacturer: company.pk }} />
        )
      },
      {
        name: 'supplied-parts',
        label: t`Supplied Parts`,
        icon: <IconBuildingWarehouse />,
        hidden: !company?.is_supplier,
        content: company?.pk && (
          <SupplierPartTable params={{ supplier: company.pk }} />
        )
      },
      {
        name: 'purchase-orders',
        label: t`Purchase Orders`,
        icon: <IconShoppingCart />,
        hidden: !company?.is_supplier,
        content: company?.pk && <PurchaseOrderTable supplierId={company.pk} />
      },
      {
        name: 'stock-items',
        label: t`Stock Items`,
        icon: <IconPackages />,
        hidden: !company?.is_manufacturer && !company?.is_supplier,
        content: company?.pk && (
          <StockItemTable
            allowAdd={false}
            tableName="company-stock"
            params={{ company: company.pk }}
          />
        )
      },
      {
        name: 'sales-orders',
        label: t`Sales Orders`,
        icon: <IconTruckDelivery />,
        hidden: !company?.is_customer,
        content: company?.pk && <SalesOrderTable customerId={company.pk} />
      },
      {
        name: 'return-orders',
        label: t`Return Orders`,
        icon: <IconTruckReturn />,
        hidden: !company?.is_customer,
        content: company.pk && (
          <ReturnOrderTable params={{ customer: company.pk }} />
        )
      },
      {
        name: 'assigned-stock',
        label: t`Assigned Stock`,
        icon: <IconPackageExport />,
        hidden: !company?.is_customer,
        content: company?.pk ? (
          <StockItemTable
            allowAdd={false}
            tableName="assigned-stock"
            params={{ customer: company.pk }}
          />
        ) : (
          <Skeleton />
        )
      },
      {
        name: 'contacts',
        label: t`Contacts`,
        icon: <IconUsersGroup />,
        content: company?.pk && <ContactTable companyId={company.pk} />
      },
      {
        name: 'addresses',
        label: t`Addresses`,
        icon: <IconMap2 />,
        content: company?.pk && <AddressTable companyId={company.pk} />
      },
      {
        name: 'attachments',
        label: t`Attachments`,
        icon: <IconPaperclip />,
        content: (
          <AttachmentTable
            model_type={ModelType.company}
            model_id={company.pk}
          />
        )
      },
      {
        name: 'notes',
        label: t`Notes`,
        icon: <IconNotes />,
        content: (
          <NotesEditor
            modelType={ModelType.company}
            modelId={company.pk}
            editable={
              user.hasChangeRole(UserRoles.purchase_order) ||
              user.hasChangeRole(UserRoles.sales_order) ||
              user.hasChangeRole(UserRoles.return_order)
            }
          />
        )
      }
    ];
  }, [id, company, user]);

  const editCompany = useEditApiFormModal({
    url: ApiEndpoints.company_list,
    pk: company?.pk,
    title: t`Edit Company`,
    fields: companyFields(),
    onFormSuccess: refreshInstance
  });

  const companyActions = useMemo(() => {
    return [
      <AdminButton model={ModelType.company} pk={company.pk} />,
      <ActionDropdown
        tooltip={t`Company Actions`}
        icon={<IconDots />}
        actions={[
          EditItemAction({
            hidden: !user.hasChangeRole(UserRoles.purchase_order),
            onClick: () => editCompany.open()
          }),
          DeleteItemAction({
            hidden: !user.hasDeleteRole(UserRoles.purchase_order)
          })
        ]}
      />
    ];
  }, [id, company, user]);

  const badges: ReactNode[] = useMemo(() => {
    return [
      <DetailsBadge
        label={t`Inactive`}
        color="red"
        visible={company.active == false}
      />
    ];
  }, [company]);

  return (
    <>
      {editCompany.modal}
      <InstanceDetail status={requestStatus} loading={instanceQuery.isFetching}>
        <Stack gap="xs">
          <PageDetail
            title={t`Company` + `: ${company.name}`}
            subtitle={company.description}
            actions={companyActions}
            imageUrl={company.image}
            breadcrumbs={props.breadcrumbs}
            badges={badges}
          />
          <PanelGroup pageKey="company" panels={companyPanels} />
        </Stack>
      </InstanceDetail>
    </>
  );
}
