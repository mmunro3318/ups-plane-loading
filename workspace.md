# Workspace

## Notes

The web app looks _really_ nice. A few observations and asks:

- Let's add an initial landing page that shows various plane models. We'll use selectors/buttons similar to the reference image to select the plane type. Each plane type should have its own card and image asset -- the cool model design in the `ui-reference.webp` is perfect -- I want to create those exact style models (images) for each plane (though we'll only have functionality for the 757 right now).
- I like the cargo manifest display on the left of the screen, and the "Sort manifest" card on the right is really cool. 
- On the plane image in the center of the screen: 
  - I would like to remove the background (it's currently a white square background, and looks bad). But the cyber-blue plane diagram is really cool.
  - I want the ULD squares to line up with the fuselage to match what it would actually look like in the plane. 
  - The main feature/info we're communicating to the user is the ULD positions in the top deck -- so the fuselage is the main focus. We can englarge and expand the image so that the fuselage takes up the majority of the screen, with a gradient falloff to transparent at the edges. 

- I _really_ like that scroll feature you included for the ULD column over the plane image. Ideally, the plane image in the background will scroll as well, preserving the ULD placement relative to the plane's fuselage (and the MAC line should also follow correctly).
- ULD IDs are always of the form AAY###### (for the A2's), or AAD###### (for the A1's). Example: `AAY007324`. Pallets are always PAG###### or PAH######. Example: `PAG001234`.
- For the ULD cards in the Cargo Manifest section, I want to change the "A2"/"PAG" tags you've included to instead be the position of the ULD in the load order.
- Hazmat: (firstly, I love the visuals) but there are several types of Hazmat materials a ULD can possess, and those contents are important for placement in the plane, and restrictions for adjacent placement, so we need to note in the ULD data structure (like in the `mcts-load-ordering.ipynb`)
  - These contents are labeled U (unrestricted), B (batteries), M (magnetized), C (corrosive), F (flammable), A (accessible), R (radioactive). 
  - `A` ULDs must be placed in position 1.
  - `M` ULDs must be placed in a position away from sensitive electronics in the plane. We won't address that in our current implementation.
  - `U` are ULDs that possess things like batteries (that didn't classify as restricted batteries), but don't actually have any placement restrictions.
  - `F` can't be placed near any ULDs that are corrosive or radioactive, or Lithium Ion batteries (B).
  - `R` can't be placed within `N` inches of the crew based on it's TI rating/value.

- Currently, the "Sort Manifest" button doesn't do anything. We need to implement the logic for sorting the manifest based on the ULD properties and restrictions, using the annealing algorithm.

---

Let's batch these features for development:

1. Fix the fuselage background and ULD alignment.
2. Apply tweaks to ULD cards and data structures (including Hazmat constraints).
3. Hook up a functional sort algorithm that runs when we click "Sort Manifest".
4. Add the initial landing page with plane model selectors.

**Note:** Research the hazmat labels and constraints used by UPS for the ULDs and plane loading. 

---

Prompt: A high-quality 3D stylized low-poly model of a [PLANE TYPE] in UPS cargo livery (white fuselage, dark brown top, and gold tail logo). The aircraft is shown from an isometric 3/4 top-down perspective. [DETAILS]. The model has clean, smooth surfaces and a matte finish, resembling a premium desk toy. The background is a moody dark teal and black gradient with soft studio lighting and a subtle vignette. The image is framed as a digital collectible card with minimalist white sans-serif text at the bottom displaying the plane name and a registration number, and a small UPS logo in the top left corner.