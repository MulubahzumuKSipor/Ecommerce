import TopRatedProducts from "../ui/components/toprated";
import styles from "../ui/styles/category.module.css";

export default function BestSellersPage() {
    return (
        <div className={styles.container}>
            <TopRatedProducts  />
        </div>

    );
}