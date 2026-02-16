export const STEP_CATEGORIES = [
  {
    id: "property",
    title: "Property Disputes",
    subtitle: "Land, rent, or ancestral property issues",
    icon: "home",
    color: "bg-blue-100 text-blue-600",
    steps: [
      {
        title: "Collect Property Documents",
        description: "Gather sale deed, property tax receipts, and agreements."
      },
      {
        title: "Send Legal Notice",
        description: "Issue a notice to the opposing party through a lawyer."
      },
      {
        title: "File Case in Court",
        description: "Approach the civil court having jurisdiction."
      }
    ],
    documents: [
      "Sale Deed",
      "Property Tax Receipt",
      "Identity Proof"
    ]
  },
  {
    id: "consumer",
    title: "Consumer Complaints",
    subtitle: "Faulty products or poor services",
    icon: "shopping-bag",
    color: "bg-orange-100 text-orange-600",
    steps: [
      {
        title: "Send Legal Notice",
        description: "Give seller 15 days to resolve the issue."
      },
      {
        title: "File Complaint",
        description: "Submit complaint to Consumer Commission."
      },
      {
        title: "Attend Hearing",
        description: "Present your case with documents."
      }
    ],
    documents: [
      "Invoice/Bill",
      "Legal Notice Copy",
      "ID Proof"
    ]
  }
];
