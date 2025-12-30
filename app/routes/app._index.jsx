import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

const ProductTable = () => (
  <s-section padding="none" accessibilityLabel="Product alert table section">
    <s-table paginate hasNextPage hasPreviousPage>
      <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
        <div className="search-container">
          <s-text-field
            label="Search products"
            labelAccessibilityVisibility="exclusive"
            icon="search"
            placeholder="Search by product"
          />
        </div>
      </s-grid>
      <s-table-header-row>
        <s-table-header listSlot="primary">Product</s-table-header>
        <s-table-header>SKU</s-table-header>
        <s-table-header listSlot="secondary">Status</s-table-header>
        <s-table-header format="numeric">Inventory</s-table-header>
        <s-table-header format="numeric">Threshold</s-table-header>
        <s-table-header>Email Sent</s-table-header>
        <s-table-header>Sent Time</s-table-header>
        <s-table-header>Last Updated</s-table-header>
        <s-table-header>Action</s-table-header>
      </s-table-header-row>
      <s-table-body>
        <ProductTableRow />
      </s-table-body>
    </s-table>
  </s-section>
)

const ProductTableRow = () => (
  <>
    <s-table-row>
      <s-table-cell>
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-clickable
            href=""
            accessibilityLabel="Mountain View puzzle thumbnail"
            border="base"
            borderRadius="base"
            overflow="hidden"
            inlineSize="40px"
            blockSize="40px"
          >
            <s-image
              objectFit="cover"
              src="https://picsum.photos/id/29/80/80"
            />
          </s-clickable>
          <s-link href="">Mountain View</s-link>
        </s-stack>
      </s-table-cell>
      <s-table-cell>TSH-BLK-M</s-table-cell>
      <s-table-cell>
        <s-badge color="base" tone="success">
          Active
        </s-badge>
      </s-table-cell>
      <s-table-cell>16</s-table-cell>
      <s-table-cell>5</s-table-cell>
      <s-table-cell>
        <s-badge color="base" tone="success">
          Success
        </s-badge>
      </s-table-cell>
      <s-table-cell>
        2 min age
      </s-table-cell>
      <s-table-cell>
        10 days age
      </s-table-cell>
      <s-table-cell>
        <s-button-group>
          <s-button slot="secondary-actions" icon="alert-octagon" accessibilityLabel="View alert history" commandFor="history-modal" />
          <s-button slot="secondary-actions" icon="delete" tone="critical" accessibilityLabel="Remove product from alerts" commandFor="delete-modal" />
        </s-button-group>
      </s-table-cell>
    </s-table-row>
    <s-table-row>
      <s-table-cell>
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-clickable
            href=""
            accessibilityLabel="Mountain View puzzle thumbnail"
            border="base"
            borderRadius="base"
            overflow="hidden"
            inlineSize="40px"
            blockSize="40px"
          >
            <s-image
              objectFit="cover"
              src="https://picsum.photos/id/29/80/80"
            />
          </s-clickable>
          <s-link href="">Mountain View</s-link>
        </s-stack>
      </s-table-cell>
      <s-table-cell>TSH-BLK-M</s-table-cell>
      <s-table-cell>
        <s-badge color="base" tone="warning">
          Low stock
        </s-badge>
      </s-table-cell>
      <s-table-cell>6</s-table-cell>
      <s-table-cell>5</s-table-cell>
      <s-table-cell>
        <s-badge color="base" tone="critical">
          Failed
        </s-badge>
      </s-table-cell>
      <s-table-cell>
        1 hour age
      </s-table-cell>
      <s-table-cell>
        10 days age
      </s-table-cell>
      <s-table-cell>
        <s-button-group>
          <s-button slot="secondary-actions" icon="alert-octagon" accessibilityLabel="View alert history" commandFor="history-modal" />
          <s-button slot="secondary-actions" icon="delete" tone="critical" accessibilityLabel="Remove product from alerts" commandFor="delete-modal" />
        </s-button-group>
      </s-table-cell>
    </s-table-row>
    <s-table-row>
      <s-table-cell>
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-clickable
            href=""
            accessibilityLabel="Mountain View puzzle thumbnail"
            border="base"
            borderRadius="base"
            overflow="hidden"
            inlineSize="40px"
            blockSize="40px"
          >
            <s-image
              objectFit="cover"
              src="https://picsum.photos/id/29/80/80"
            />
          </s-clickable>
          <s-link href="">Mountain View</s-link>
        </s-stack>
      </s-table-cell>
      <s-table-cell>TSH-BLK-M</s-table-cell>
      <s-table-cell>
        <s-badge color="base" tone="critical">
          Out of stock
        </s-badge>
      </s-table-cell>
      <s-table-cell>0</s-table-cell>
      <s-table-cell>4</s-table-cell>
      <s-table-cell>
        <s-badge color="base" tone="success">
          Success
        </s-badge>
      </s-table-cell>
      <s-table-cell>
        2 min age
      </s-table-cell>
      <s-table-cell>
        10 days age
      </s-table-cell>
      <s-table-cell>
        <s-button-group>
          <s-button slot="secondary-actions" icon="alert-octagon" accessibilityLabel="View alert history" commandFor="history-modal" />
          <s-button slot="secondary-actions" icon="delete" tone="critical" accessibilityLabel="Remove product from alerts" commandFor="delete-modal" />
        </s-button-group>
      </s-table-cell>
    </s-table-row>
  </>
)

const HistoryModal = () => (
  <s-modal id="history-modal" heading="Alert History: {{product_name}}">
    <s-table>
      <s-table-header-row>
        <s-table-header>Date & Time</s-table-header>
        <s-table-header>Recipient</s-table-header>
        <s-table-header format="numeric">Stock Level</s-table-header>
        <s-table-header>Status</s-table-header>
      </s-table-header-row>
      <s-table-body>
        <s-table-row>
          <s-table-cell>Oct 24, 10:15 AM</s-table-cell>
          <s-table-cell>admin@store.com</s-table-cell>
          <s-table-cell>23</s-table-cell>
          <s-table-cell>
            <s-badge color="base" tone="success">
              Delivered
            </s-badge>
          </s-table-cell>
        </s-table-row>
      </s-table-body>
    </s-table>
    <s-button slot="secondary-actions" commandFor="history-modal" command="--hide">
      Close
    </s-button>
    <s-button
      slot="primary-action"
      variant="primary"
      commandFor="history-modal"
      command="--hide"
    >
      Clear Logs
    </s-button>
  </s-modal>
)

const DeleteModal = () => (
  <s-modal id="delete-modal" heading="Remove alert?">
    <s-stack gap="base">
      <s-text>Are you sure you want to stop alert for &quot;Winter jacket&quot;?</s-text>
      <s-text tone="caution">This action cannot be undone.</s-text>
    </s-stack>

    <s-button
      slot="primary-action"
      variant="primary"
      tone="critical"
      commandFor="delete-modal"
      command="--hide"
    >
      Remove alert
    </s-button>
    <s-button
      slot="secondary-actions"
      variant="secondary"
      commandFor="delete-modal"
      command="--hide"
    >
      Cancel
    </s-button>
  </s-modal>
)

const EmptyProductState = () => (
  <s-section accessibilityLabel="Empty state section">
    <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
      <s-box maxInlineSize="200px" maxBlockSize="200px">
        <s-image
          aspectRatio="1/0.5"
          src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          alt="A stylized graphic of a document"
        />
      </s-box>
      <s-grid justifyItems="center" maxBlockSize="450px" maxInlineSize="450px">
        <s-heading>No products selected for alerts</s-heading>
        <s-paragraph>
          <p className="text-center">Add the products you want to monitor and set their inventory thresholds to
            start receiving low stock notifications.</p>
        </s-paragraph>
        <s-stack
          gap="small-200"
          justifyContent="center"
          padding="base"
          paddingBlockEnd="none"
          direction="inline"
        >
          <s-button href="/app/products/new" variant="primary">
            Add product to watch
          </s-button>
        </s-stack>
      </s-grid>
    </s-grid>
  </s-section>
);

export default function AppIndex() {

  return (
    <>
      <s-page heading="Home">
        <s-link slot="secondary-actions" href="/app/products/new">
          Add product to watch
        </s-link>
        <ProductTable />
        <EmptyProductState />
      </s-page>
      <HistoryModal />
      <DeleteModal />
    </>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};