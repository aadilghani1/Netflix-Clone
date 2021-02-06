import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, updatePlan } from "../features/userSlice";
import db from "../firebase";
import "./PlansScreen.css";
import { loadStripe } from "@stripe/stripe-js";
import loadinggif from "./loadinggif.gif";

function PlansScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);
  const dispatch = useDispatch();
  useEffect(() => {
    setTimeout(async () => {
      await setLoading(false);
    }, 1000);
  }, []);
  useEffect(() => {
    db.collection("customers")
      .doc(user.uid)
      .collection("subscriptions")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach(async (subscription) => {
          setSubscription({
            role: subscription.data().role,
            current_period_end: subscription.data().current_period_end.seconds,
            current_period_start: subscription.data().current_period_start
              .seconds,
          });
        });
      });
  }, [user.uid]);

  useEffect(() => {
    db.collection("products")
      .where("active", "==", true)
      .get()
      .then((querySnapshot) => {
        const products = {};
        querySnapshot.forEach(async (productDoc) => {
          products[productDoc.id] = productDoc.data();
          const priceSnap = await productDoc.ref.collection("prices").get();
          priceSnap.docs.forEach((price) => {
            products[productDoc.id].prices = {
              priceId: price.id,
              priceData: price.data(),
            };
          });
        });
        setProducts(products);
      });
  }, []);

  const loadCheckout = async (priceId) => {
    const dockRef = await db
      .collection("customers")
      .doc(user.uid)
      .collection("checkout_sessions")
      .add({
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

    dockRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data();

      if (error) {
        alert(`An error occured: ${error.message}`);
      }

      if (sessionId) {
        // We have a session, lets redirect to checkout
        // init Stripe
        const stripe = await loadStripe(
          "pk_test_51IHZ7DAy9Bwpc75F8DrZP5seexD69meCyOEWQUfhXgopkDl3Cnq7Pyc4RVk7AiQ8SszScChSoIFcbqwYhNbE0tW900w7FpnOcQ"
        );
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };
  if (subscription) {
    dispatch(updatePlan(subscription.role));
  }
  return (
    <>
      {loading ? (
        <img className="loading" src={loadinggif} alt="Loading Icon"/>
      ) : (
        <div className="plansScreen">
          <br />
          {subscription && (
            <p>
              Renewal date:{" "}
              {new Date(
                subscription?.current_period_end * 1000
              ).toLocaleDateString()}
            </p>
          )}
          {Object.entries(products).map(([productId, productData]) => {
            //TODO add some logic to check if the user's subscription is active... Done!
            const isCurrentPackage = productData.name
              ?.toLowerCase()
              .includes(subscription?.role);

            return (
              <div
                key={productId}
                className={`${
                  isCurrentPackage && "planScreen_plan--disabled"
                } plansScreen__plan`}
              >
                <div className="plansScreen__info">
                  <h5>{productData.name}</h5>
                  <h6>{productData.description}</h6>
                </div>

                <button
                  onClick={() =>
                    !isCurrentPackage &&
                    loadCheckout(productData.prices.priceId)
                  }
                >
                  {isCurrentPackage ? "Current Package" : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default PlansScreen;
