import { faker } from "@faker-js/faker";
import { format, parse } from "date-fns";

const sources = Array.from({ length: 20 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
}));

const mediums = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
}));

const campaigns = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
}));

const contents = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
}));

const products = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
}));

type Link = {
  link_id: string;
  link_name: string;
  link_url: string;
  link_source_name: string | null;
  link_medium_name: string | null;
  link_campaign_name: string | null;
  link_content_name: string | null;
};

const links = Array.from({ length: 300 }, () => ({
  link_id: faker.string.uuid(),
  link_name: faker.company.name(),
  link_url: faker.internet.url(),
  link_source_name:
    faker.helpers.maybe(() => faker.helpers.arrayElement(sources).name, {
      probability: 0.8,
    }) ?? null,
  link_medium_name:
    faker.helpers.maybe(() => faker.helpers.arrayElement(mediums).name, {
      probability: 0.7,
    }) ?? null,
  link_campaign_name:
    faker.helpers.maybe(() => faker.helpers.arrayElement(campaigns).name, {
      probability: 0.6,
    }) ?? null,
  link_content_name:
    faker.helpers.maybe(() => faker.helpers.arrayElement(contents).name, {
      probability: 0.6,
    }) ?? null,
})) as Link[];

const users = Array.from({ length: 1000 }, () => ({
  user_id: faker.string.uuid(),
  username: faker.internet.username(),
  user_email: faker.internet.email(),
  user_subscription_date: format(faker.date.past({ years: 2 }), "dd.MM.yyyy"),
})) as User[];

type User = {
  user_id: string;
  username: string;
  user_email: string;
  user_subscription_date: string;
};

export type Item = {
  id: string;
  amount: number | null;
  request_date: string;
  purchase_date: string | null;
  product_name: string;
} & Link &
  User;

export const items = Array.from({ length: 10_000 }, () => {
  const isPurchase = faker.helpers.arrayElement([true, false]);
  const selectedUser = faker.helpers.arrayElement(users);

  const userSubscriptionDate = parse(
    selectedUser.user_subscription_date,
    "dd.MM.yyyy",
    new Date()
  );

  // Генерируем дату заявки после даты подписки пользователя
  const requestDate = faker.date.between({
    from: userSubscriptionDate,
    to: new Date(),
  });

  // Генерируем дату покупки после даты заявки (если есть покупка)
  const purchaseDate = isPurchase
    ? faker.date.between({
        from: requestDate,
        to: new Date(),
      })
    : null;

  return {
    id: faker.string.uuid(),
    amount: isPurchase ? faker.number.int({ min: 100, max: 1000 }) : null,
    request_date: format(requestDate, "dd.MM.yyyy"),
    purchase_date: purchaseDate ? format(purchaseDate, "dd.MM.yyyy") : null,
    product_name: faker.helpers.arrayElement(products).name,
    ...faker.helpers.arrayElement(links),
    ...selectedUser,
  };
}) as Item[];
