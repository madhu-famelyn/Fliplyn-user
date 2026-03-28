
import useCartStore from "../Pages/store/cartStore";

const CartIndicator = () => {
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <div className="cart-indicator">
      <span>{totalItems} items</span>
      <span>₹{totalPrice}</span>
    </div>
  );
};

export default CartIndicator;