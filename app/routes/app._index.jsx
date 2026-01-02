/* eslint-disable react/prop-types */
import db from "../db.server";
import { truncate } from "../utils"
import { authenticate } from "../shopify.server";
import { getAlertProducts } from "../models/AlertProduct.server"
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData, useLocation, useNavigate, useSearchParams, useSubmit } from "react-router";
import { createContext, useContext, useState } from "react";
import { useDebouncedCallback } from "use-debounce"

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);

  const paginationData = await getAlertProducts(session.shop, admin.graphql, page);

  return {
    ...paginationData,
    currentPage: page,
  };
}

export async function action({ request }) {
  const { session, redirect } = await authenticate.admin(request);
  const { shop } = session;

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  if (data.action === "delete") {
    await db.alertProduct.delete({ where: { id: Number(data.id) } });
  }

  return redirect("/app");
}

const AppContext = createContext();

const ProductTable = () => {

  const { items, hasNextPage, hasPreviousPage, totalCount, currentPage } = useLoaderData();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }, 300)

  function handlePaginate(newPage) {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString())
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    })
  }

  return (
    <s-section padding="none" accessibilityLabel="Product alert table section">
      <div className="table-container">
        <div className="table">
          <s-table paginate={totalCount > 10} hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} onNextPage={() => handlePaginate(currentPage + 1)} onPreviousPage={() => handlePaginate(currentPage - 1)}>
            <s-grid slot="filters" gap="small-200" gridTemplateColumns="1fr auto">
              <div className="search-container">
                <s-text-field
                  onInput={(e) => handleSearch(e.target.value)}
                  defaultValue={searchParams.get("query")?.toString()}
                  label="Search products"
                  labelAccessibilityVisibility="exclusive"
                  icon="search"
                  placeholder="Search by product"
                />
              </div>
            </s-grid>
            <s-table-header-row>
              <s-table-header listSlot="primary">Product</s-table-header>
              <s-table-header>Variant</s-table-header>
              <s-table-header>SKU</s-table-header>
              <s-table-header format="numeric">Inventory</s-table-header>
              <s-table-header format="numeric">Threshold</s-table-header>
              <s-table-header>Action</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {items.map((product) => (
                <ProductTableRow key={product.id} product={product} />
              ))}
            </s-table-body>
          </s-table>
        </div>
      </div>
    </s-section>
  )
}

const ProductTableRow = ({ product }) => {
  const { setProduct } = useContext(AppContext);
  return (
    <s-table-row id={product.id}>
      <s-table-cell>
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-clickable
            href={`/app/products/${product.id}`}
            accessibilityLabel={`Go to the product page for ${product.productTitle}`}
            border="base"
            borderRadius="base"
            overflow="hidden"
            inlineSize="40px"
            blockSize="40px"
          >
            <div className="image-wrapper">
              {product.productImage ? (
                <s-image objectFit="cover" src={product.productImage}></s-image>
              ) : (
                <s-icon size="large" type="image" />
              )}
            </div>
          </s-clickable>
          <s-link href={`/app/products/${product.id}`}>
            {truncate(product.productTitle)}
          </s-link>
        </s-stack>
      </s-table-cell>
      <s-table-cell>{product.variantTitle}</s-table-cell>
      <s-table-cell>{product.sku ?? "No SKU"}</s-table-cell>
      <s-table-cell>{product.inventory}</s-table-cell>
      <s-table-cell>{product.threshold}</s-table-cell>
      <s-table-cell>
        <s-button-group>
          <s-button slot="secondary-actions" icon="alert-octagon" accessibilityLabel="View alert history" commandFor="history-modal" />
          <s-button slot="secondary-actions" icon="delete" tone="critical" onClick={() => setProduct(product)} accessibilityLabel="Remove product from alerts" commandFor="delete-modal" />
        </s-button-group>
      </s-table-cell>
    </s-table-row>
  )
}

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

const DeleteModal = () => {
  const { handleDelete, selectedProduct } = useContext(AppContext);

  return (
    <s-modal id="delete-modal" heading="Remove alert?">
      <s-stack gap="base">
        <s-text>Are you sure you want to stop alert for &quot;{selectedProduct?.productTitle}&quot;?</s-text>
        <s-text tone="caution">This action cannot be undone.</s-text>
      </s-stack>

      <s-button
        onClick={handleDelete}
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
}

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

  const { items } = useLoaderData();

  const submit = useSubmit();

  const [selectedProduct, setSelectedProduct] = useState(null);

  function setProduct(product) {
    setSelectedProduct(product);
  }

  function handleDelete() {
    if (!selectedProduct) return;
    submit({ action: "delete", id: selectedProduct.id }, { method: "post" });
  }

  return (
    <AppContext.Provider value={{ selectedProduct, handleDelete, setProduct }}>
      <s-page heading="Home">
        <s-button slot="secondary-actions" href="/app/products/new">
          Add product to watch
        </s-button>
        {items.length === 0 ? (
          <EmptyProductState />
        ) : (
          <ProductTable />
        )}
      </s-page>
      <HistoryModal />
      <DeleteModal />
    </AppContext.Provider>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};