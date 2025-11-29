import Landing from "./ui/components/landing_page";
import ProductList from "@/app/ui/components/products";
import CategoryList from "./ui/components/shared/categoriesList";
import NewArrivalsList from "./ui/components/shared/newArrivals";
import TopRatedProducts from "./ui/components/toprated";


export default function Home() {
  return (
    <>
      <Landing />
      <CategoryList/>
      <ProductList limit={4} />
      <TopRatedProducts limit={5} />
      <NewArrivalsList limit={8} title="🔥 Top 8 Latest Items"/>


    </>
  );
}
